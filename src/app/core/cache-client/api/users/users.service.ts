import { Injectable } from '@angular/core';
import type { User } from '@cache-server/api/users/user';
import type { Languages } from '@core/utility/i18n/languages';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthenticatedService } from '../../authenticated.service';
import { CacheClientService } from '../../cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    constructor(
        private readonly cacheClientService: CacheClientService,
        private readonly authenticatedService: AuthenticatedService
    ) {}

    /**
     * Requests a password reset email, which allows a user to set a new password
     * @param authenticationEmail Email of the user
     */
    public async requestResetPassword(authenticationEmail: string) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'requestResetPassword',
                options: {
                    authenticationEmail,
                },
            },
        });
    }

    /**
     * Verifies the email of a user
     * @param token Token with verify_email scope
     */
    public async verifyEmail(token: string) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'verifyEmail',
                options: {
                    token,
                },
            },
        });
    }

    /**
     * edits the properties of the currently authenticated user
     * @returns the response from the server
     */
    public async editUser(
        name: string,
        language: keyof Languages<unknown>,
        publicEmail: string | null,
        notificationEmail: string
    ) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'editUser',
                options: {
                    name,
                    language,
                    publicEmail,
                    notificationEmail,
                },
            },
        });
    }

    /**
     * get the currently authenticated user
     * @returns the user
     */
    public getUser(): Observable<User> {
        return this.authenticatedService.isAuthenticated$.pipe(
            filter((isAuthenticated) => isAuthenticated),
            switchMap(() =>
                this.cacheClientService.handleSubscribeAction({
                    type: 'users',
                    action: {
                        kind: 'getUser',
                    },
                })
            )
        );
    }

    public async updateUser() {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'updateUser',
            },
        });
    }

    /**
     * sends a verification email to the users authenticationEmail
     * @param email the email to be added to the verified emails of a user
     */
    public async addEmail(email: string) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'addEmail',
                options: {
                    email,
                },
            },
        });
    }

    /**
     * Removes a email to the currently authenticated user
     */
    public async removeEmail(email: string) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'removeEmail',
                options: {
                    email,
                },
            },
        });
    }

    /**
     * Requests a authentication email change email.
     */
    public async requestAuthEmailChange() {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'requestAuthEmailChange',
            },
        });
    }

    /**
     * @param authenticationEmail a email that has already been added to the user's emails
     * @param authenticationEmailChangeToken a token with the requestAuthenticationEmailChange_scope
     */
    public async changeAuthEmail(
        authenticationEmail: string,
        authenticationEmailChangeToken: string
    ) {
        return this.cacheClientService.handleAction({
            type: 'users',
            action: {
                kind: 'changeAuthEmail',
                options: {
                    authenticationEmail,
                    authenticationEmailChangeToken,
                },
            },
        });
    }
}
