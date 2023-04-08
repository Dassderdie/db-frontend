import type { UUID } from '@cache-server/api/uuid';
import type { CacheConversation } from '@cache-server/cache-conversation';
import type { CustomError } from '@core/utility/errors/errors-manager';

export type SharedWorkerConversation =
    | DestroyedConversation
    | ErrorsConversation
    | HeartbeatConversation
    | NormalConversation;

interface NormalConversation {
    message: {
        type: 'normal';
        data: CacheConversation['message'];
        clientId: UUID;
    };
    response: {
        type: 'normal';
        data: CacheConversation['response'];
    };
}

/**
 * If an error occurred it should be send to all tabs
 */
export interface ErrorsConversation {
    message: never;
    response: {
        type: 'error';
        error: CustomError;
    };
}

/**
 * To have no memory/subscription-leak if a window is killed by e.g. task-manager they should send a heartbeat
 */
export interface HeartbeatConversation {
    message: {
        type: 'heartbeat';
        clientId: UUID;
    };
    response: never;
}

/**
 * The client tells that he should be considered destroyed
 */
export interface DestroyedConversation {
    message: {
        type: 'destroyed';
        clientId: UUID;
    };
    response: never;
}
