import type { ApiConversationFactory } from '../api-conversation-factory';
import type { TablesApi } from './tables-api';

export type TablesConversation = ApiConversationFactory<
    'tables',
    TablesApi,
    'createTable' | 'deleteTable' | 'editTable' | 'getTables' | 'updateTables', // getTables can be used to get the mostRecent tables after the tables have been edited
    'getTable' | 'getTables'
>;
