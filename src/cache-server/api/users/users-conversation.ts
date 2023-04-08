import type { ApiConversationFactory } from '../api-conversation-factory';
import type { UsersApi } from './users-api';

export type UsersConversation = ApiConversationFactory<
    'users',
    UsersApi,
    | 'addEmail'
    | 'changeAuthEmail'
    | 'editUser'
    | 'removeEmail'
    | 'requestAuthEmailChange'
    | 'requestResetPassword'
    | 'updateUser'
    | 'verifyEmail',
    'getUser'
>;
