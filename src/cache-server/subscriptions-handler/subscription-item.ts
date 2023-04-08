import type { ApiConversation } from '@cache-server/api/api-conversation';
import type { ProgressConversation } from '@cache-server/cache-conversation';
import { isEqual } from 'lodash-es';
import type { Subject } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class SubscriptionItem<
    Message extends ApiConversation['subscribable']['message'] = ApiConversation['subscribable']['message'],
    // TODO: get the Data from ResponseData<Message, SubscribableApiConversation> (currently ts doesn't narrow generic types deep enough)
    Data extends SubscriptionItemData = SubscriptionItemData
> {
    /**
     * A dictionary where the key is the unique subscriptionId
     * and the value is a Subject that, when it emits, unsubscribes from the client (= cleans up the subscription)
     */
    public unsubscribers: { [subscriptionId: string]: Subject<Data> } = {};
    /**
     * The latestValue emitted by the replaySubject
     */
    public latestValue?: Data;
    /**
     * Undefined if the cache has not subscribed to the updates stream (WebSocket) of this item
     */
    public updateStream?: {
        /**
         * A function that unwatches the updateStream
         */
        destroy: () => void;
        /**
         * Wether the updateStream is connected
         */
        connected: boolean;
    };
    /**
     * When set the item is currently renewing its value
     * -> the promise resolves when this process is finished
     * -> it also works as a semaphore: when undefined the item is not currently renewing
     */
    public currentlyRenewing?: Promise<Data>;
    /**
     * If undefined the value has not yet been retrieved from the server (the request ist pending)
     */
    public lastRenewedAt?: number;
    /**
     * The last time this item has been subscribed to
     * When it is currently subscribed to, this value isn't correct - check the unsubscribers property
     * If undefined the value has not yet been subscribed to yet
     */
    public lastSubscribedAt?: number;
    /**
     * If defined its value is the time it was set
     *
     * Sometimes an item gets updated directly e.g. from the response of a post-request.
     * An update-stream will nevertheless send an update-event.
     * This property enables the cache to know when such a situation happened and therefore save one unnecessary request
     */
    public skipUpdateAt?: number;
    private readonly latestValueE$: ReplaySubject<Data & SubscriptionItemData> =
        new ReplaySubject(1);
    public latestValue$ = this.latestValueE$.asObservable();
    /**
     * If undefined no error has occured yet
     */
    public latestErrorReceivedAt?: number;
    private readonly errorE$: Subject<unknown> = new ReplaySubject(1);
    /**
     * Emits always the latest error (a new value resets the previous error)
     */
    public error$ = this.errorE$.pipe(
        filter(
            (e) =>
                !this.lastRenewedAt ||
                this.lastRenewedAt < this.latestErrorReceivedAt!
        )
    );
    /**
     * Emits an progress-event, when te progress-status changes
     */
    public progress$: Subject<ProgressConversation['response']['data']> =
        new ReplaySubject(1);

    constructor(public readonly message: Message) {}

    /**
     * Destroys the subscriptionItem
     */
    static destroy(item: SubscriptionItem) {
        const subscriptionIds = Object.keys(item.unsubscribers);
        // It is wanted behaviour to destroy an item with subscribers, when the user logs out
        for (const subscriptionId of subscriptionIds) {
            SubscriptionItem.removeSubscription(item, subscriptionId);
        }
        item.latestValueE$.complete();
        item.errorE$.complete();
        item.progress$.complete();
        item.updateStream?.destroy();
    }

    /**
     * Changes the value of the subscriptionItem
     */
    static setValue(
        item: SubscriptionItem,
        // TODO: higher type safety
        newValue: SubscriptionItemData
    ) {
        if (
            // if the latestValue is at the beginning undefined, without it being emitted
            item.latestValue !== undefined &&
            isEqual(item.latestValue, newValue)
        ) {
            return;
        }
        item.latestValue = newValue;
        item.latestValueE$.next(newValue);
        item.lastRenewedAt = Date.now();
    }

    static setError(item: SubscriptionItem, error: unknown) {
        item.latestErrorReceivedAt = Date.now();
        item.errorE$.next(error);
    }

    static removeSubscription(item: SubscriptionItem, subscriptionId: string) {
        if (!item.unsubscribers[subscriptionId]) {
            errors.error({
                message: `Unknown Subscriber: ${subscriptionId}`,
                logValues: { item },
            });
            return;
        }
        item.unsubscribers[subscriptionId]!.next(undefined);
        item.unsubscribers[subscriptionId]!.complete();
        delete item.unsubscribers[subscriptionId];
    }
}

export type SubscriptionItemData =
    ApiConversation['subscribable']['response']['data'];
