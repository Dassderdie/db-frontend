import { ReplaySubject, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import type { CustomHttpHandler } from '../../http-handler/custom-http-handler';
import type { CustomStorage } from '../../storage/custom-storage';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthEvent } from './auth-event';
import type { CreateLoginTokenResponseData } from './create-login-token-response-data';

export class AuthApi extends Api {
    /**
     * Whether token exists and is still valid
     */
    public get authenticated() {
        return !!(
            this.token && this.getTokenExpirationDate(this.token) > Date.now()
        );
    }
    // TODO:
    // private static readonly tokenCacheKey = 'api-token';
    private readonly authEventE$ = new Subject<AuthEvent>();
    /**
     * Emits when the authenticated status changes
     */
    public readonly authEvent$ = this.authEventE$.asObservable();
    private readonly latestAuthEventE$ = new ReplaySubject<AuthEvent>(1);
    /**
     * Emits always the latest authEvent
     * (difference to authEventObservable: this here starts with the latest one, this = ReplaySubject, other = Subject)
     */
    public latestAuthEvent$ = this.latestAuthEventE$.asObservable();
    /**
     * JSON web token used for authentication
     */
    public token?: string;
    private readonly tokenE$ = new ReplaySubject<string | undefined>(1);
    /**
     * An observable that emits always the current token or undefined if the user got logged out
     */
    public token$ = this.tokenE$.asObservable();
    /**
     * Timeout for JWT token
     */
    private timeoutTimer?: NodeJS.Timeout;
    private renewTimer?: NodeJS.Timeout;

    constructor(
        private readonly http: CustomHttpHandler,
        private readonly storage: CustomStorage,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
        // TODO:
        // check wether there is already a token in the cache
        // const token = this.storage.get<string>(AuthApi.tokenCacheKey);
        // if (token && this.getTokenExpirationDate(token) < Date.now()) {
        //     this.token = token;
        // }
        this.authEvent$.subscribe(this.latestAuthEventE$);
    }

    private getTokenExpirationDate(token: string): number {
        // Because JWT uses seconds instead of milliseconds as a time unit
        return JSON.parse(atob(token.split('.')[1]!)).exp * 1000;
    }

    /**
     * Creates a new user
     * @param password Password of user
     */
    public async register(options: {
        name: string;
        email: string;
        password: string;
        language: string;
    }): Promise<null> {
        return this.http
            .post<null>('/users', options)
            .then((response) => response.data);
    }

    /**
     * Logs in as a user
     */
    public async login(options: {
        authenticationEmail: string;
        /**
         * Password of user
         */
        password: string;
    }): Promise<null> {
        return this.http
            .post<CreateLoginTokenResponseData>('/users/create-token', options)
            .then((response) => {
                const data = response.data;
                this.setToken(data.token);
                this.authEventE$.next('logged-in');
                return null;
            });
    }

    /**
     * Logs out the currently logged in user
     */
    public async logout(): Promise<null> {
        this.cleanUpAuth('logout');
        return Promise.resolve(null);
    }

    /**
     * Updates the user's password using a token from a reset password email
     */
    public async resetPassword(options: {
        /**
         * Token with reset_password scope
         */
        token: string;
        /**
         * New password for user
         */
        password: string;
    }): Promise<null> {
        return this.http
            .post<null>(
                '/users/reset-password',
                {
                    password: options.password,
                },
                options.token
            )
            .then((response) => response.data);
    }

    /**
     * To get (as a client) wether the user is already authenticated
     */
    public async isLoggedIn(): Promise<boolean> {
        return Promise.resolve(this.authenticated);
    }

    /**
     * @returns a Promise that resolves to the current token when the user is successful authenticated
     */
    public async whenAuthenticated() {
        if (this.authenticated) {
            return Promise.resolve(this.token!);
        }
        this.cleanUpAuth('renew-login');
        return this.authEventE$
            .pipe(
                filter((event) => event === 'logged-in'),
                first(),
                map((event) => {
                    if (this.authenticated) {
                        return this.token!;
                    }
                    throw Error(
                        'user is logged-in, but the token is still not valid'
                    );
                })
            )
            .toPromise();
    }

    /**
     * @param sendEvent Wether the logout was intentional ('logout'), or caused by the timeout timer ('renew-login)
     */
    private cleanUpAuth(sendEvent: 'logout' | 'renew-login') {
        if (this.renewTimer) {
            clearTimeout(this.renewTimer);
        }
        this.token = undefined;
        this.tokenE$.next(undefined);
        this.authEventE$.next(sendEvent);
        this.storage.deleteAll();
    }

    /**
     * reloads the user and gets a new token
     */
    private renewToken() {
        if (this.authenticated) {
            return this.getNewToken().then(
                (data) => {
                    this.setToken(data.token);
                },
                (error) => {
                    errors.error({
                        message: `Couldn't renew authentication token`,
                        error,
                    });
                }
            );
        }
        this.cleanUpAuth('renew-login');
        return undefined;
    }

    /**
     * Renews the token of a user
     */
    private async getNewToken() {
        return this.http
            .post<CreateLoginTokenResponseData>(
                '/users/renew-token',
                {},
                this.token
            )
            .then((response) => {
                this.subscriptionHandler.cache(
                    {
                        type: 'users',
                        action: {
                            kind: 'getUser',
                        },
                    },
                    response.data.user
                );
                return response.data;
            });
    }

    /**
     * Updates token and data associated with it
     * @param token New token
     * @param user Token's user
     */
    private setToken(token: string) {
        this.token = token;
        this.tokenE$.next(token);
        // TODO:
        // this.storage.set(AuthApi.tokenCacheKey, token);
        // Timeout when token expires
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        const expiresAt = this.getTokenExpirationDate(token);
        this.timeoutTimer = setTimeout(() => {
            if (this.authenticated) {
                this.cleanUpAuth('renew-login');
            }
        }, expiresAt - Date.now());
        // Renew the token 1 min before it expires
        let timeUntilRenew = expiresAt - Date.now() - 60 * 1000;
        if (timeUntilRenew < 0) {
            timeUntilRenew = 0;
        }
        if (this.renewTimer) {
            clearTimeout(this.renewTimer);
        }
        this.renewTimer = setTimeout(() => {
            this.renewToken();
        }, timeUntilRenew);
    }
}
