import type { ApiConversationFactory } from '../api-conversation-factory';
import type { AuthApi } from './auth-api';

export type AuthConversation = ApiConversationFactory<
    'auth',
    AuthApi,
    'isLoggedIn' | 'login' | 'logout' | 'register' | 'resetPassword'
>;
