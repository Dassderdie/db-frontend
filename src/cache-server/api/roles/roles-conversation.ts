import type { ApiConversationFactory } from '../api-conversation-factory';
import type { RolesApi } from './roles-api';

export type RolesConversation = ApiConversationFactory<
    'roles',
    RolesApi,
    | 'acceptInvitation'
    | 'editColumnOrders'
    | 'editFavoriteTables'
    | 'editFilters'
    | 'editRole'
    | 'editTableViews'
    | 'inviteUser'
    | 'leaveProject'
    | 'removeUser',
    'getRole' | 'getRoles'
>;
