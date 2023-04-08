import type { ApiConversation } from '@cache-server/api/api-conversation';
import type { AuthApi } from '@cache-server/api/auth/auth-api';
import type { UUID } from '@cache-server/api/uuid';
import { objectToKey } from '@cache-server/object-to-key';
import type { SubscriptionItem } from '@cache-server/subscriptions-handler/subscription-item';
import type { JsonObject } from '@shared/utility/types/json-object';
import { isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { merge, of, Subject } from 'rxjs';
import { filter, first, map, switchMap, takeUntil } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { SubscriptionData } from './subscription-response';
import { WebSocketClient } from './web-socket-client';

export class UpdateWatcher {
    private readonly webSocketClient: WebSocketClient;
    /**
     * The maximum  delay (in ms) after which an updateEvent will received by this client
     * e.g. new entry is created -> maxResponseTime ms after the answer to this POST-request
     * has been received the event in the webSocket has been received
     */
    public readonly maxResponseTime = 2 * 1000;
    /**
     * The maximum number of updateStreams that should be open at the same time
     */
    private readonly maxNumberOfUpdateStreams = 5;

    private readonly subscriptions: {
        [key: string]: {
            /**
             * An observable that emits always when the value matching to the message changes
             * or the connections gets build up/closes
             */
            update$: Observable<UpdateEventKind>;
            /**
             * Emit to complete the updateStream (you still have to clean up everything)
             */
            complete$: Subject<unknown>;
            requestId: UUID;
            item: SubscriptionItem;
            subscriptionId?: UUID;
        };
    } = {};

    constructor(auth: AuthApi) {
        this.webSocketClient = new WebSocketClient(auth);
    }

    /**
     * @returns an observable that emits always when the value matching to the message changes or
     * undefined if no such observable is available
     */
    public getUpdateStream(
        item: SubscriptionItem
    ): Observable<UpdateEventKind> | undefined {
        const data = this.getStreamData(item.message);
        if (data) {
            return this.watch(data, item);
        }
        return undefined;
    }

    /**
     * Completes (+ cleans up) the matching observable from getUpdateStream
     */
    public destroyUpdateStream(
        message: ApiConversation['subscribable']['message']
    ): void {
        const data = this.getStreamData(message);
        if (data) {
            this.unwatch(objectToKey(data));
        }
    }

    /**
     * Unwatches (if necessary) the oldest unused updateStreams, to stay in the limit of updateStreams
     */
    public checkUpdateStreams() {
        // the number of streams that should be unwatched
        const unwatchNumber =
            Object.keys(this.subscriptions).length -
            this.maxNumberOfUpdateStreams;
        if (unwatchNumber <= 0) {
            return;
        }
        // An array of the keys for the items that should be unwatched of this.subscriptions,
        // that is sorted after item.lastSubscriptedAt(undefined, <), its length is <= unwatchNumber
        const unwatchKeys: string[] = [];
        for (const [key, subscription] of Object.entries(this.subscriptions)) {
            const item = subscription.item;
            if (!isEmpty(item.unsubscribers)) {
                continue;
            }
            // TODO: this is just a very ugly workaround for inserting the key at the right index in the sorted array
            const lastKey: string | undefined =
                unwatchKeys[unwatchKeys.length - 1];
            if (!lastKey || this.comparator(key, lastKey) < 0) {
                unwatchKeys.push(key);
            }
            unwatchKeys.sort(this.comparator.bind(this));
        }
        for (const key of unwatchKeys) {
            this.unwatch(key);
        }
    }

    /**
     * @returns the data object for the watch/unwatch operation
     * or undefined if there is no such data object (== webSocket endpoint)
     */
    private getStreamData(
        message: ApiConversation['subscribable']['message']
    ): JsonObject | undefined {
        switch (message.type) {
            case 'versions':
                if (message.action.kind === 'getNewestVersion') {
                    return {
                        event: 'entryUpdate',
                        projectId: message.action.options.projectId,
                        entryId: message.action.options.entryId,
                    };
                }
                break;
            case 'roles':
                if (message.action.kind === 'getRole') {
                    return {
                        event: 'roleUpdate',
                        projectId: message.action.options.projectId,
                        roleId: message.action.options.userId,
                    };
                }
                break;
            // there is nothing to watch
            case 'projects':
            case 'tables':
            case 'users':
        }
        return undefined;
    }

    /**
     * Subscribes to an event
     * (as a side effect watchers that are not in use could be unwatched)
     * @returns emits always when a response to the subscribed item comes
     */
    private watch(
        data: JsonObject,
        item: SubscriptionItem
    ): Observable<UpdateEventKind> | undefined {
        const key = objectToKey(data);
        if (this.subscriptions[key]) {
            return this.subscriptions[key]!.update$;
        }
        const requestId = uuidv4();
        // sendRequest is a cold observable -> it won't do anything until you subscribe to it
        const sendRequest: Observable<UpdateEventKind> = this.webSocketClient
            .sendAuthenticated<SubscriptionData>('subscribe', data, requestId)
            .pipe(
                // only one emit is expected
                switchMap((responseData) => {
                    if ('subscriptionId' in responseData) {
                        // set subscriptionId to clean it up from it afterwards
                        this.subscriptions[key]!.subscriptionId =
                            responseData.subscriptionId;
                        return merge(
                            // send responseData with it to transform it to 'connected' (of this individual stream)
                            of('connected' as const),
                            this.webSocketClient.listenToResponses<SubscriptionData>(
                                responseData.subscriptionId
                            )
                        );
                    }
                    return of(responseData);
                }),
                map((response) => {
                    if (response === 'connected') {
                        // this single stream has connected
                        return 'connected';
                    }
                    if (
                        'message' in response &&
                        response.message === 'eventPublished'
                    ) {
                        return 'update';
                    }
                    return undefined;
                }),
                filter(
                    (
                        response: 'closed' | 'connected' | 'update' | undefined
                    ): response is UpdateEventKind => !!response
                )
            );
        const complete$ = new Subject();
        if (sendRequest) {
            this.subscriptions[key] = {
                update$: this.webSocketClient.connectionState$.pipe(
                    map((state) => (state === 'error' ? 'closed' : state)),
                    switchMap((state) => {
                        if (state === 'connected') {
                            return sendRequest;
                        }
                        return of(state);
                    }),
                    takeUntil(complete$)
                ),
                complete$,
                requestId,
                item,
                subscriptionId: undefined,
            };
            this.checkUpdateStreams();
            return this.subscriptions[key]!.update$;
        }
        return undefined;
    }

    private unwatch(key: string): void {
        const requestId = uuidv4();
        const subscriptionId = this.subscriptions[key]?.subscriptionId;
        if (!subscriptionId) {
            // When there is no subscriptionId yet then there also doesn't has to be an unsubscription
            // TODO: what if subscription request is already send and response not there yet?
            this.cleanUpInWatcher(key, requestId);
            return;
        }
        this.webSocketClient
            .sendAuthenticated(
                'unsubscribe',
                {
                    subscriptionId,
                },
                requestId
            )
            .pipe(first())
            .toPromise()
            .finally(() => this.cleanUpInWatcher(key, requestId));
    }

    private cleanUpInWatcher(key: string, unsubscribeId?: UUID) {
        const subscription = this.subscriptions[key]!;
        subscription.complete$.next(undefined);
        subscription.complete$.complete();
        // clean up the subscription
        // (the subscriptionItem is cleaned up when the source completes)
        this.webSocketClient.cleanUpSource(subscription.requestId);
        // clean up the response stream with the subscriptionId
        if (subscription.subscriptionId) {
            this.webSocketClient.cleanUpSource(subscription.subscriptionId);
        }
        if (unsubscribeId) {
            // clean up the unsubscription
            this.webSocketClient.cleanUpSource(unsubscribeId);
        }
        delete this.subscriptions[key];
    }

    /**
     * @param key1 key of subscriptions
     * @param key2 key of subscriptions
     * @returns
     * -1 : key1 < key2
     *  0 : key1 = key2
     * +1 : key1 > key2
     */
    private comparator(key1: string, key2: string) {
        const subscribedAt1 =
            this.subscriptions[key1]!.item.lastSubscribedAt ?? 0;
        const subscribedAt2 =
            this.subscriptions[key2]!.item.lastSubscribedAt ?? 0;
        if (subscribedAt1 === subscribedAt2) {
            return 0;
        }
        return subscribedAt1 < subscribedAt2 ? -1 : 1;
    }
}

export type UpdateEventKind = 'closed' | 'connected' | 'update';
