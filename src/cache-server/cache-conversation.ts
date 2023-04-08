import type { Optional } from '@shared/utility/types/optional';
import type { ApiConversation } from './api/api-conversation';
import type { AuthEvent } from './api/auth/auth-event';
import type { UUID } from './api/uuid';
import type { SubscriptionConversation } from './subscription-conversation';

export type CacheConversation =
    | CacheNormalConversation
    | ConnectConversation
    | ErrorConversation
    | IsLoggedInConversation
    | ProgressConversation
    | SubscriptionConversation;

export interface ProgressConversation {
    message: never;
    response: {
        type: 'progress';
        data: 'taskFinished' | 'taskStarted';
    };
}

/**
 * Response with a stream of auth-events, which keep the client informed about the login status
 * starts with the last one
 * Will be send as soon as the client has send his first message (including connect)
 */
export interface IsLoggedInConversation {
    message: never;
    response: {
        type: 'isLoggedIn';
        data: AuthEvent;
    };
}

export interface CacheNormalConversation {
    message: ApiConversation['normal']['message'] & { id: UUID };
    response: {
        id: UUID;
    } & (
        | ApiConversation['normal']['response']
        | (Optional<ApiConversation['normal']['response'], 'data'> & {
              error?: unknown;
          })
    );
}

/**
 * The client should send the connect-message first. He will get a connect response back.
 * The sw. could be terminated at any time -> if the client gets this response again,
 * he should resend all messages, which were send before the "messageId", because all cache-data has been lost
 */
export interface ConnectConversation {
    message: {
        type: 'connect';
        id: UUID;
    };
    response: {
        type: 'connect';
        /**
         * The version of the application that is being used by the service worker
         */
        version: string;
        /**
         * The id of the message that triggered this response (= first message from the client to this (instance) of the cache-server)
         */
        messageId: UUID;
        error?: unknown;
    };
}

/**
 * When this is send to the client he should display this error to the user - sth. has gone wrong :(
 */
export interface ErrorConversation {
    message: never;
    response: {
        type: 'error';
        error?: any;
    };
}
