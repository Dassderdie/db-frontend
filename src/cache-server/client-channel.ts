import type { CacheConversation } from './cache-conversation';

export interface ClientChannel {
    id: string;
    postMessage: (
        response: CacheConversation['response'],
        transfer?: []
    ) => void;
}
