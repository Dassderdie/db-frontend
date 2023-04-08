import type { UUID } from '@cache-server/api/uuid';

export type SubscriptionData =
    | {
          message: 'eventPublished' | 'subscribed' | 'unsubscribed';
      }
    | {
          subscriptionId: UUID;
      };
