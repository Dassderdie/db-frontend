import type { ApiConversationFactory } from '../api-conversation-factory';
import type { EditEntriesApi } from './edit-entries-api';

export type EditEntriesConversation = ApiConversationFactory<
    'editEntries',
    EditEntriesApi,
    'createEntry' | 'deleteEntry' | 'editEntry'
>;
