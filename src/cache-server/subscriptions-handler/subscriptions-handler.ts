import type { ApiConversation } from '@cache-server/api/api-conversation';
import type { ProgressConversation } from '@cache-server/cache-conversation';
import type { HttpProgressHandler } from '@cache-server/http-handler/http-progress-handler';
import type { UpdateEventKind } from '@cache-server/websockets/update-watcher';
import { UpdateWatcher } from '@cache-server/websockets/update-watcher';
import { isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { finalize, first, takeUntil } from 'rxjs/operators';
import { v4 as uuid4 } from 'uuid';
import { ApiHandler } from '../api/api-handler';
import type { CustomHttpHandler } from '../http-handler/custom-http-handler';
import type { CustomStorage } from '../storage/custom-storage';
import type { OptionalOptionsMessage } from './optional-options-message';
import type { CacheServerResponse } from './response';
import type { SubscriptionItemData } from './subscription-item';
import { SubscriptionItem } from './subscription-item';
import { SubscriptionsStorage } from './subscriptions-storage';

/**
 * Clients can subscribe here to subscribableActions and get an observable of the current value of the response to the action
 * Each client has to unsubscribe when he doesn't need the value anymore.
 * If the user logs out all subscriptions will be unsubscribed and deleted
 */
export class SubscriptionsHandler {
    public readonly actionsHandler: ApiHandler;
    private readonly updateWatcher: UpdateWatcher;
    private readonly subscriptionsStorage: SubscriptionsStorage;
    /**
     * The time in ms to wait between checking for maxAge, maxCachedAge, maxUpdateStreamAge, ...
     */
    private readonly updateInterval = 2 * 60 * 1000;
    /**
     * The maximum time (+ <=updateInterval) in ms for a SubscriptionItem before it should get renewed
     */
    private readonly maxAge = 10 * 60 * 1000;
    /**
     * The maximum time in ms (+ <=updateInterval) before a SubscriptionItem should get deleted from the cache
     */
    private readonly maxCachedAge = 20 * 60 * 1000;
    /**
     * The maximum time in ms (+ <=updateInterval) that the updateStream of a SubscriptionItem should be watched
     * without the SubscriptionItem being used
     */
    private readonly maxUpdateStreamAge = 10 * 60 * 1000;

    constructor(
        storage: CustomStorage,
        http: CustomHttpHandler,
        httpProgress: HttpProgressHandler
    ) {
        this.actionsHandler = new ApiHandler(http, httpProgress, this, storage);
        this.updateWatcher = new UpdateWatcher(this.actionsHandler.auth);
        this.subscriptionsStorage = new SubscriptionsStorage();
        this.actionsHandler.auth.authEvent$.subscribe((event) => {
            if (event === 'logout') {
                this.subscriptionsStorage.deleteAllItems();
            }
        });
        setInterval(
            async () => this.renewItems(undefined, true),
            this.updateInterval
        );
    }

    /**
     * @param message
     * @param subscriptionId
     * @param noUpdateStream wether no new updateStream should be created even if possible
     * @returns an Observable that emits always the most recent value
     */
    public subscribe<
        Message extends ApiConversation['subscribable']['message'],
        Data extends SubscriptionItemData
    >(
        message: Message,
        subscriptionId: string,
        noUpdateStream = false
    ): ClientObservables<Data> {
        let item = this.subscriptionsStorage.getItem<Message, Data>(message);
        if (!item) {
            item = new SubscriptionItem<Message, Data>(message);
            this.subscriptionsStorage.addItem(item);
        }
        if (!item.unsubscribers[subscriptionId]) {
            item.unsubscribers[subscriptionId] = new Subject();
        } else {
            errors.error({
                message: `The client ${subscriptionId} has already subscribed to the item`,
                logValues: { message },
            });
            return this.getClientObservable<Data>(item, subscriptionId);
        }
        // undefined would mean, that it has not been subscribed to yet
        item.lastSubscribedAt = Date.now();
        // the watchStream should be check/applied first, because it renews after the connect-response -> no renews necessary
        // (isOutdated() takes care of it)
        if (!noUpdateStream) {
            this.tryToWatchUpdateStream(item);
        }
        if (this.isOutdated(item, this.maxAge)) {
            this.renewItem(item);
        }
        return this.getClientObservable<Data>(item, subscriptionId);
    }

    /**
     * for api internal use e.g. to get the current userId to leave a project without sending an unnecessary request to the backend
     * @param message
     * @returns a promise that cleans itself up afterwards
     */
    public async getOneItem<
        Message extends ApiConversation['subscribable']['message']
    >(
        message: Message
    ): Promise<
        CacheServerResponse<Message, ApiConversation['subscribable']>['data']
    > {
        // create a unique id for this subscription
        const subscriptionId = uuid4();
        // TODO: ?do not use old cached value, but renew it if necessary?
        // if this is the only subscription to the item, no updateStream should get created
        return this.subscribe<Message, any>(message, subscriptionId, true)
            .data$.pipe(
                first(),
                finalize(() => this.unsubscribe(subscriptionId, message))
            )
            .toPromise();
    }

    /**
     * Unsubscribes a client from a specified item/the item that has the otherwise provided message
     */
    public unsubscribe(
        subscriptionId: string,
        message: ApiConversation['subscribable']['message']
    ): void;
    public unsubscribe(
        subscriptionId: string,
        message: undefined,
        itemP?: SubscriptionItem
    ): void;
    public unsubscribe(
        subscriptionId: string,
        message?: ApiConversation['subscribable']['message'],
        itemP?: SubscriptionItem
    ): void {
        const item = message
            ? this.subscriptionsStorage.getItem(message)
            : itemP;
        if (!item || !item.unsubscribers[subscriptionId]) {
            // After the user logs out all items get automatically deleted -> unsubscription-messages from the client(s) have a delay
            // -> the item is here already gone
            if (this.actionsHandler.auth.authenticated) {
                errors.error({
                    message: `The subscription ${subscriptionId} cannot unsubscribe from something that doesn't exist`,
                    logValues: { message },
                    status: 'logWarning',
                });
            }
            return;
        }
        SubscriptionItem.removeSubscription(item, subscriptionId);
        item.lastSubscribedAt = Date.now();
        if (isEmpty(item.unsubscribers)) {
            if (this.isOutdated(item, this.maxCachedAge)) {
                this.subscriptionsStorage.deleteItem(item.message);
            } else if (item.updateStream) {
                // this items updateStream could not have been removed before
                // to stay in the limit of updateStreams, because it had subscribers
                this.updateWatcher.checkUpdateStreams();
            }
        }
    }

    /**
     * Caches a value that is e.g. retrieved from the response of another request
     * @param skipUpdate Wether the next updateEvent should be skipped, because it only notifies about this change
     */
    public cache<
        Message extends ApiConversation['subscribable']['message'],
        Data extends CacheServerResponse<
            Message,
            ApiConversation['subscribable']
        >['data']
    >(message: Message, newData: Data, skipUpdate = false) {
        let item = this.subscriptionsStorage.getItem(message);
        if (!item) {
            item = new SubscriptionItem(message);
            this.subscriptionsStorage.addItem(item);
        }
        item.skipUpdateAt = skipUpdate ? Date.now() : undefined;
        SubscriptionItem.setValue(item, newData);
    }

    /**
     * @param filter a message with all options optional, if undefined all items will be renewed
     * @param force
     * true: all items matching the filter, that are not watched should be either renewed/deleted
     * false: only items that are not up to date will be renewed/deleted
     * Renews all values that are matching the provided filter
     * @returns a promise that resolves to all renewed data, when all dataRenewals are completed
     */
    public async renewItems<
        Message extends ApiConversation['subscribable']['message'],
        Data extends CacheServerResponse<
            Message,
            ApiConversation['subscribable']
        >['data']
    >(filter?: OptionalOptionsMessage<Message>, force = true): Promise<Data[]> {
        const promises: Promise<Data>[] = [];
        this.subscriptionsStorage.forAllItems((item) => {
            if (isEmpty(item.unsubscribers)) {
                if (force || this.isOutdated(item, this.maxCachedAge)) {
                    this.subscriptionsStorage.deleteItem(item.message);
                } else if (
                    item.updateStream &&
                    (item.lastSubscribedAt === undefined ||
                        Date.now() - item.lastSubscribedAt >
                            this.maxUpdateStreamAge)
                ) {
                    // stop the updateStream when the item has not been used in the last maxUpdateStreamAge
                    item.updateStream.destroy();
                }
            } else if (
                // TODO: for syncing "&& !item.updateStream" could be not intended?
                (force && !item.updateStream?.connected) ||
                this.isOutdated(item, this.maxAge)
            ) {
                promises.push(this.renewItem(item));
            }
        }, filter);
        return Promise.all(promises);
    }

    /**
     * Renews the data of the item
     * @returns a Promise that resolves to the new data
     */
    private async renewItem(item: SubscriptionItem<any, any>): Promise<any> {
        if (item.currentlyRenewing) {
            // TODO: abort request and retry?
            return item.currentlyRenewing;
        }
        // send the progress event
        item.progress$.next('taskStarted');
        item.currentlyRenewing = this.actionsHandler
            .handleActions(item.message)
            .then((value) => {
                SubscriptionItem.setValue(item, value as SubscriptionItemData);
                // TODO: necessary?
                item.skipUpdateAt = undefined;
                return value;
            })
            .catch((error) => {
                SubscriptionItem.setError(item, error);
                throw error;
            })
            .finally(() => {
                item.progress$.next('taskFinished');
                item.currentlyRenewing = undefined;
            });
        return item.currentlyRenewing;
    }

    /**
     * Checks wether updates for the item should be watched and makes the necessary adjustments
     */
    private tryToWatchUpdateStream(item: SubscriptionItem<any, any>) {
        // if is not already watched and if it has currently subscribers
        if (!item.updateStream && !isEmpty(item.unsubscribers)) {
            const updates$ = this.updateWatcher.getUpdateStream(item);
            if (updates$) {
                // watch
                item.updateStream = {
                    destroy: () =>
                        // cleans up when the updatesStream completes
                        this.updateWatcher.destroyUpdateStream(item.message),
                    connected: false,
                };
                updates$
                    .pipe(
                        finalize(() => {
                            // we know that the items value was correct during the updateStream
                            item.lastRenewedAt = Date.now();
                            item.updateStream = undefined;
                        })
                    )
                    .subscribe((event) => this.handleUpdateStream(event, item));
            }
        }
    }

    private handleUpdateStream(event: UpdateEventKind, item: SubscriptionItem) {
        if (!item.updateStream) {
            errors.error({
                message:
                    'An item must have an updateStream, when an emit of it should be handled',
            });
            return;
        }
        // if an outdated-item has no subscribers it is not worth being cached or even sending a request to renew it
        if (Object.keys(item.unsubscribers).length <= 0) {
            this.subscriptionsStorage.deleteItem(item.message);
            return;
        }
        if (event === 'closed') {
            item.updateStream.connected = false;
            return;
        }
        if (event === 'connected') {
            // Because before this subscription there could have been a change
            this.renewItem(item);
            item.updateStream.connected = true;
            return;
        }
        // skip when the item should have already been updated e.g. from the response of a post-request
        if (
            item.skipUpdateAt &&
            item.skipUpdateAt + this.updateWatcher.maxResponseTime < Date.now()
        ) {
            errors.error({
                message: 'skipped an item (does this ever happen?)',
                logValues: { item, length: item.skipUpdateAt - Date.now() },
            });
            item.skipUpdateAt = undefined;
            return;
        }
        this.renewItem(item);
    }

    private getClientObservable<
        Data extends ApiConversation['subscribable']['response']['data']
    >(
        subscriptionItem: SubscriptionItem<any, Data>,
        subscriptionId: string
    ): ClientObservables<Data> {
        const unsubscriber = subscriptionItem.unsubscribers[subscriptionId]!;
        return {
            data$: subscriptionItem.latestValue$.pipe(takeUntil(unsubscriber)),
            error$: subscriptionItem.error$.pipe(takeUntil(unsubscriber)),
            progress$: subscriptionItem.progress$.pipe(takeUntil(unsubscriber)),
        };
    }

    /**
     * @param item
     * @param maxAge in ms
     * @returns wether the item is outdated for more than maxAge ms
     * (when it is currently (for the first time) retrieved it will return true)
     */
    private isOutdated(
        storedItem: SubscriptionItem<
            // TODO: any instead of default because of https://github.com/microsoft/TypeScript/issues/27808
            any,
            any
        >,
        maxAge: number
    ) {
        return (
            // if the cache renews this item always when it updates, then it is considered to be up to date
            !storedItem.updateStream?.connected &&
            (storedItem.lastRenewedAt === undefined ||
                Date.now() - storedItem.lastRenewedAt > maxAge)
        );
    }
}

interface ClientObservables<Data> {
    data$: Observable<Data>;
    error$: Observable<unknown>;
    progress$: Observable<ProgressConversation['response']['data']>;
}
