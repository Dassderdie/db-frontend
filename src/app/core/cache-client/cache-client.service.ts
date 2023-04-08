import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { ApiConversation } from '@cache-server/api/api-conversation';
import type { AuthEvent } from '@cache-server/api/auth/auth-event';
import type { UUID } from '@cache-server/api/uuid';
import type {
    CacheConversation,
    CacheNormalConversation,
} from '@cache-server/cache-conversation';
import { objectToKey } from '@cache-server/object-to-key';
import type {
    SubscribeConversation,
    UnsubscribeConversation,
} from '@cache-server/subscription-conversation';
import type { CacheServerResponse } from '@cache-server/subscriptions-handler/response';
import { MessageService } from '@core/utility/messages/message.service';
import { ProgressBarService } from '@core/utility/progress-bar/progress-bar.service';
import packageInfo from 'package.json';
import type { Observable } from 'rxjs';
import { ReplaySubject, Subject } from 'rxjs';
import { finalize, first, map, shareReplay } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { CacheClient } from './cache-client';
import { FallbackCacheClient } from './cache-client';
import { SharedWorkerService } from './shared-worker.service';

@Injectable({
    providedIn: 'root',
})
export class CacheClientService {
    /**
     * The time in ms after which a subscription should be unsubscribed, when it doesn't have subscribers anymore
     */
    private readonly cacheTimeout = 20 * 1000;

    public get authEvent$() {
        return this.authEventE$.asObservable();
    }

    private readonly client: CacheClient;
    private readonly authEventE$ = new Subject<AuthEvent>();
    /**
     * A dictionary for all the messages send
     * key = objectToKey(message)
     */
    private readonly requests: {
        [key: string]: Request<
            CacheConversation['message'],
            CacheConversation['response']
        >;
    } = {};

    /**
     * A dictionary where the key is the stringified message of a
     * subscriptionMessage and the value the id of a matching conversation
     */
    private subscriptionKeyId: {
        [subscriptionKey: string]: UUID;
    } = {};

    constructor(
        private readonly messageService: MessageService,
        private readonly progressBarService: ProgressBarService,
        private readonly sharedWorkerService: SharedWorkerService
    ) {
        this.client =
            this.sharedWorkerService.createSharedWorkerClient() ??
            new FallbackCacheClient();
        this.postMessage(this.client, {
            type: 'connect',
        });
        this.client.message$.subscribe((response) => {
            let sourceObj: {
                key: string;
                error?: any;
                complete: boolean;
            };
            switch (response.type) {
                case 'connect':
                    if (packageInfo.version !== response.version) {
                        this.messageService.postMessage(
                            {
                                color: 'danger',
                                title: _('messages.version-missmatch.title'),
                                body: _('messages.version-missmatch.body'),
                            },
                            'alert'
                        );
                        console.error(
                            `Client version is ${packageInfo.version}. Service-Worker version is ${response.version}.`
                        );
                    }
                    return;
                case 'error':
                    errors.error({
                        error: response.error,
                    });
                    return;
                case 'isLoggedIn':
                    this.authEventE$.next(response.data);
                    return;
                case 'progress':
                    if (response.data === 'taskStarted') {
                        this.progressBarService.addTask();
                    } else {
                        this.progressBarService.resolveTask();
                    }
                    return;
                case 'unsubscribeFromAll':
                    return;
                case 'renewItems':
                    sourceObj = {
                        key: response.id,
                        error: response.error,
                        complete: true,
                    };
                    break;
                case 'subscribe':
                    sourceObj = {
                        key: response.id,
                        complete: false,
                    };
                    break;
                case 'unsubscribe':
                    sourceObj = {
                        key: response.id,
                        complete: true,
                    };
                    break;
                default:
                    // normal conversation
                    sourceObj = {
                        key: response.id,
                        complete: true,
                    };
                    if ('error' in response) {
                        sourceObj.error = response.error;
                    }
            }
            const request = this.requests[sourceObj.key];
            if (!request) {
                console.error(
                    'Unexpected response from sw: ',
                    response,
                    this.requests
                );
                return;
            }
            if (sourceObj.error) {
                request.response$.error(sourceObj.error);
                if (request.displayGenericError) {
                    errors.error({
                        error: sourceObj.error,
                    });
                }
            } else {
                request.response$.next(response);
            }
            if (sourceObj.complete) {
                this.cleanUpRequest(sourceObj.key);
            }
        });
    }

    public handleSubscribeAction<
        Message extends ApiConversation['subscribable']['message'],
        Res extends CacheServerResponse<
            Message,
            ApiConversation['subscribable']
        >
    >(action: Message): Observable<Res['data']> {
        const key = objectToKey(action);
        const subscriptionId: UUID = this.subscriptionKeyId[key]!;
        if (subscriptionId) {
            return this.getDataObservable(subscriptionId);
        }
        return this.createSubscription(this.client, key, action);
    }

    private createSubscription(
        client: CacheClient,
        key: string,
        action: ApiConversation['subscribable']['message']
    ) {
        const messageNoId: Omit<SubscribeConversation['message'], 'id'> = {
            type: 'subscribe',
            action,
        };
        const message = this.postMessage(client, messageNoId);
        const subscriptionId = message.id;
        if (this.subscriptionKeyId[key]) {
            console.error(
                `${subscriptionId} is the second subscription for the key: `,
                key
            );
        }
        this.subscriptionKeyId[key] = subscriptionId;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const request = {
            message,
            response$: new ReplaySubject(1),
        } as Request<
            SubscribeConversation['message'],
            SubscribeConversation['response']
        >;
        this.requests[subscriptionId] = request as any;
        // TODO: add Timer warning if a source has more than x observers/is still subscribed to after y min
        // to find potential memory leaks
        request.data$ = request.response$.pipe(
            map((r) => r.data),
            finalize(() => {
                // all subscribers have currently unsubscribed, keep this for a little bit still in the cache -> after that clean up
                // (timeout is expected to be cleared if meanwhile another subscription to this is made)
                request.cleanUpTimeout = setTimeout(
                    () => this.cleanUpSubscription(subscriptionId, key),
                    this.cacheTimeout
                );
            }),
            // to only trigger finalize call when all subscribers have unsubscribed
            // See https://medium.com/angular-in-depth/rxjs-whats-changed-with-sharereplay-65c098843e95
            // about the config - the observable should unsubscribe from the responses-subject (and with this call finalize()),
            // when it has no subscribers anymore
            shareReplay({ bufferSize: 1, refCount: true })
        );
        return this.getDataObservable(subscriptionId);
    }

    private cleanUpSubscription(subscriptionId: UUID, key: string) {
        // unsubscribe from it and clean the subscription-request up afterwards
        // (there could still come some values from the cache - server meanwhile)
        // - if during the unsubscription another subscribe - call to this is
        // carried out, a new subscribe-conversation will be created
        delete this.subscriptionKeyId[key];
        this.sendSingleActionMessage<
            Omit<UnsubscribeConversation['message'], 'id'>,
            UnsubscribeConversation['response']
        >(
            {
                type: 'unsubscribe',
                data: { subscriptionId },
            },
            true
        ).finally(() => {
            const request = this.requests[subscriptionId];
            // Wait with cleanup until positive response to not trigger "Unknown message from service-worker"-error
            // after a logout the requests are automatically removed and cleaned up
            if (request && !request.data$) {
                this.cleanUpRequest(subscriptionId);
            }
        });
    }

    private getDataObservable(subscriptionId: UUID) {
        const request = this.requests[subscriptionId]!;
        const clearUpTimeout = request.cleanUpTimeout;
        if (clearUpTimeout) {
            // if the subscription has subscribers it must not get cleaned up
            clearTimeout(clearUpTimeout);
        }
        if (!request.data$) {
            console.error(
                Error(
                    `No dataObservable available for subscription ${subscriptionId}`
                )
            );
            return request.response$ as Observable<any>;
        }
        return request.data$!;
    }

    public async handleAction<
        Message extends ApiConversation['normal']['message'],
        Res extends CacheServerResponse<Message, ApiConversation['normal']>
    >(message: Message, displayGenericError = true): Promise<Res['data']> {
        return this.sendSingleActionMessage<
            Omit<CacheNormalConversation['message'], 'id'>,
            CacheNormalConversation['response']
        >(message, displayGenericError).then((v) => v.data as Res['data']);
    }

    public async renewAll(): Promise<null> {
        return this.sendSingleActionMessage(
            {
                type: 'renewItems',
            },
            true
        ).then((r) => null);
    }

    /**
     * This function should be called after the user is logged out and everything is unsubscribed from
     */
    public cleanUpAfterLogout() {
        for (const [requestId, request] of Object.entries(this.requests)) {
            const message = request.message;
            // the logout request should get the correct response
            if (
                message.type === 'auth' &&
                'action' in message &&
                message.action.kind === 'logout'
            ) {
                continue;
            }
            this.cleanUpRequest(requestId);
        }
        this.subscriptionKeyId = {};
    }

    /**
     * Sends a message to the cache-server. - The client only expects one response to it.
     * Requests will not be resend after a reconnection (reconnections are nevertheless only expected after a longer idle-time)
     * @returns the response to this message
     */
    private async sendSingleActionMessage<
        // TODO: improve typesafety by correctly inferring the response from the message
        Message extends Omit<CacheConversation['message'], 'id'>,
        Res extends CacheConversation['response']
    >(messageNoId: Message, displayGenericError: boolean): Promise<Res> {
        const message = this.postMessage(this.client, messageNoId);
        // will get cleaned up in message listener
        this.requests[message.id] = {
            response$: new ReplaySubject(1),
            message,
            displayGenericError,
        };
        return this.requests[message.id]!.response$.pipe(
            first()
        ).toPromise() as Promise<unknown> as Promise<Res>;
    }

    /**
     * Removes all data associated with the request
     * -> be aware that it works async
     */
    private cleanUpRequest(id: string) {
        if (!this.requests[id]) {
            console.error(
                Error(`request with id ${id} has already been cleaned up.`)
            );
        }
        // Completing is more of a safety measure
        this.requests[id]?.response$.complete();
        // Timeout to make sure, that eventual unsubscriptions due to the complete-call have set the cleanUpTimeout of the request
        setTimeout(() => {
            const cleanUpTimeout = this.requests[id]?.cleanUpTimeout;
            if (cleanUpTimeout) {
                clearTimeout(cleanUpTimeout);
            }
            delete this.requests[id];
        }, 0);
    }

    /**
     * @param messageNoId A message without an id (will be generated here)
     * @returns the send message inclusive id
     */
    private postMessage(
        client: CacheClient,
        messageNoId: Omit<CacheConversation['message'], 'id'>
    ): CacheConversation['message'] {
        const id = uuidv4();
        // add the id
        (messageNoId as any).id = id;
        const message: CacheConversation['message'] = messageNoId as any;
        client.postMessage(message);
        return message;
    }
}

/**
 * the response and message have to belong to the same conversation
 */
interface Request<
    Message extends Omit<CacheConversation['message'], 'id'>,
    R extends CacheConversation['response'],
    Data extends SubscribeConversation['response']['data'] = any
> {
    message: Message;
    /*
     * Always when a response to the message comes, this subject should emit this response
     */
    response$: ReplaySubject<R>;
    /**
     * The stream that should be subscribed to, to get responses
     */
    data$?: Observable<Data>;
    /**
     * Wether a generic error-message should be shown if an error-response comes
     */
    displayGenericError?: boolean;
    /**
     * When this timeout is over the subscription gets cleaned up, expecting that there is no subscriber to it anymore
     */
    cleanUpTimeout?: NodeJS.Timeout;
}
