import type { CacheConversationFactory } from '@cache-server/conversation-factory';

// This is not used very often and there are unsound workarounds around it because of
// TODO: https://github.com/microsoft/TypeScript/issues/13995
// -> Generics extending unions cannot be narrowed
export type CacheServerResponse<
    Message extends Conversation['message'],
    Conversation extends CacheConversationFactory<any, any, unknown>
> = Extract<
    Conversation['response'],
    {
        type: Message['type'];
        action: { kind: Message['action']['kind'] };
    }
>;
