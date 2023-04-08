import type { User } from '../users/user';

export interface CreateLoginTokenResponseData {
    token: string;
    user: User;
}
