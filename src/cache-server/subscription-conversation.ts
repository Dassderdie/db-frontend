import type { JsonObject } from '@shared/utility/types/json-object';
import type { ApiConversation } from './api/api-conversation';
import type { UUID } from './api/uuid';
import type { CacheConversationFactory } from './conversation-factory';

export type SubscriptionConversation =
    | RenewAllConversation
    | SubscribeConversation
    | UnsubscribeClientConversation
    | UnsubscribeConversation;

type SubscribeConversationFactory<
    Type extends string,
    ActionMessage extends JsonObject | undefined,
    Data extends JsonObject | number | string | null | undefined
> = CacheConversationFactory<Type, ActionMessage, Data> & {
    message: { id: UUID };
    response: { id: UUID };
};

export type SubscribeConversation = SubscribeConversationFactory<
    'subscribe',
    ApiConversation['subscribable']['message'],
    ApiConversation['subscribable']['response']['data']
>;

export interface UnsubscribeConversation {
    message: { type: 'unsubscribe'; id: UUID; data: { subscriptionId: UUID } };
    response: { type: 'unsubscribe'; id: UUID };
}

type UnsubscribeClientConversation = SubscribeConversationFactory<
    'unsubscribeFromAll',
    undefined,
    undefined
>;
export type RenewAllConversation = SubscribeConversationFactory<
    'renewItems',
    undefined,
    null | undefined
> & {
    response: {
        error?: unknown;
    };
};
