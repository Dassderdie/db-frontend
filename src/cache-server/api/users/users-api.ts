import type { Languages } from '@core/utility/i18n/languages';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { User } from './user';

export class UsersApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    /**
     * Requests a password reset email, which allows a user to set a new password
     */
    public async requestResetPassword(options: {
        authenticationEmail: string;
    }): Promise<null> {
        return this.authHttp
            .post<null>('/users/request-password-reset', options, false)
            .then((response) => response.data);
    }

    /**
     * Verifies the email of a user
     */
    public async verifyEmail(options: { token: string }): Promise<null> {
        return this.authHttp.http
            .post<null>('/users/emails', {}, options.token)
            .then((response) => response.data);
    }

    /**
     * Edits the properties of the currently authenticated user
     */
    public async editUser(options: {
        name: string;
        language: keyof Languages<unknown>;
        publicEmail: string | null;
        notificationEmail: string;
    }): Promise<User> {
        return this.authHttp.put<{ user: User }>('/users', options).then(
            (response) => {
                const user = response.data.user;
                // update the value of the user
                this.subscriptionHandler.cache(
                    {
                        type: 'users',
                        action: {
                            kind: 'getUser',
                        },
                    },
                    user,
                    true
                );
                return user;
            },
            (error) => {
                this.updateUser();
                throw error;
            }
        );
    }

    /**
     * Sends a verification email to the users authenticationEmail
     */
    public async addEmail(options: { email: string }): Promise<null> {
        return this.authHttp
            .post<null>('/users/emails/send-verification-email', options)
            .then((response) => response.data);
    }

    /**
     * Removes a email to the currently authenticated user
     */
    public async removeEmail(options: { email: string }): Promise<null> {
        return this.authHttp
            .delete<null>('/users/emails', options)
            .then((response) => response.data)
            .finally(() => {
                this.updateUser();
            });
    }

    /**
     * Requests a authentication email change email.
     */
    public async requestAuthEmailChange(): Promise<null> {
        return this.authHttp
            .post<null>('/users/request-authentication-email-change', {})
            .then((response) => response.data);
    }

    /**
     * Sends the new authentication email
     */
    public async changeAuthEmail(options: {
        authenticationEmail: string;
        authenticationEmailChangeToken: string;
    }): Promise<User> {
        return this.authHttp
            .post<{ user: User }>('/users/change-authentication-email', options)
            .then(
                (response) => {
                    const user = response.data.user;
                    // update the value of the user
                    this.subscriptionHandler.cache(
                        {
                            type: 'users',
                            action: {
                                kind: 'getUser',
                            },
                        },
                        user,
                        true
                    );
                    return user;
                },
                (error) => {
                    this.updateUser();
                    throw error;
                }
            );
    }

    public async updateUser(): Promise<User> {
        return (
            this.subscriptionHandler
                .renewItems({
                    type: 'users',
                    action: {
                        kind: 'getUser',
                    },
                })
                // this filter for renewItems only fits exactly one cached conversation -> only the first item in the array is relevant
                .then((updatedUsers) => updatedUsers[0]!)
        );
    }

    /**
     * Gets information about the currently logged in user
     */
    public async getUser(): Promise<User> {
        return this.authHttp
            .get<{
                users: User[];
            }>('/users', {})
            .then((response) => response.data.users[0]!);
    }
}
