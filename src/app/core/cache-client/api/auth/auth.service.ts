import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CacheClientService } from '../../cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private readonly translateService: TranslateService,
        private readonly cacheClientService: CacheClientService
    ) {}

    /**
     * Creates a new user
     * @param password Password of user
     */
    public async register(name: string, email: string, password: string) {
        return this.cacheClientService.handleAction({
            type: 'auth',
            action: {
                kind: 'register',
                options: {
                    name,
                    email,
                    password,
                    language: this.translateService.currentLang,
                },
            },
        });
    }

    /**
     * Logs in as a user
     * @param authenticationEmail
     * @param password Password of user
     */
    public async login(authenticationEmail: string, password: string) {
        return this.cacheClientService.handleAction(
            {
                type: 'auth',
                action: {
                    kind: 'login',
                    options: { authenticationEmail, password },
                },
            },
            false
        );
    }

    /**
     * Logs out the currently logged in user
     * and/or reloads all tabs
     */
    public logout() {
        this.cacheClientService.handleAction({
            type: 'auth',
            action: {
                kind: 'logout',
            },
        });
        // An AuthEvent is fired -> AuthenticatedService deals with reloading the page
    }

    /**
     * Updates the user's password using a token from a reset password email
     * @param token Token with reset_password scope
     * @param password New password for user
     */
    public async resetPassword(token: string, password: string) {
        return this.cacheClientService.handleAction({
            type: 'auth',
            action: {
                kind: 'resetPassword',
                options: { token, password },
            },
        });
    }
}
