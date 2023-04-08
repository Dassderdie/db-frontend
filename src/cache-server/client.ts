import { Subject } from 'rxjs';
import type { ApiConversation } from './api/api-conversation';
import type { UUID } from './api/uuid';
import type { ProgressConversation } from './cache-conversation';
import type { ClientChannel } from './client-channel';

export class Client {
    public readonly destroyed = new Subject();
    /**
     * A subject that emits the progress events
     */
    public readonly progress$ = new Subject<
        ProgressConversation['response']['data']
    >();
    private readonly subscriptions: {
        [id: string]: {
            message: ApiConversation['subscribable']['message'];
        };
    } = {};

    constructor(
        private readonly clientId: UUID,
        private readonly unsubscribe: (
            subscriptionId: UUID,
            message: ApiConversation['subscribable']['message']
        ) => void,
        private readonly channel: ClientChannel
    ) {}

    public addSubscription(
        subscriptionId: UUID,
        message: ApiConversation['subscribable']['message']
    ) {
        if (this.subscriptions[subscriptionId]) {
            errors.error({
                message: `subscription ${subscriptionId} has already been added`,
                logValues: this.subscriptions,
                status: 'error',
            });
        }
        this.subscriptions[subscriptionId] = { message };
    }

    public removeSubscription(subscriptionId: UUID) {
        if (!this.subscriptions[subscriptionId]) {
            // This could be one of the first-messages from a client, after a reconnection without the client knowing yet -> no error
            errors.error({
                message: `subscription ${subscriptionId} has already been removed (by design shortly after a reconnection)`,
                logValues: this.subscriptions,
                status: 'logWarning',
            });
            return;
        }
        this.unsubscribe(
            subscriptionId,
            this.subscriptions[subscriptionId]!.message
        );
        delete this.subscriptions[subscriptionId];
    }

    public destroy() {
        for (const [subscriptionId, subscription] of Object.entries(
            this.subscriptions
        )) {
            this.unsubscribe(subscriptionId, subscription.message);
        }
        this.progress$.complete();
        this.destroyed.next(undefined);
    }
}
