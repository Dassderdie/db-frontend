import type { CustomHttpHandler } from '@cache-server/http-handler/custom-http-handler';
import type { HttpProgressHandler } from '@cache-server/http-handler/http-progress-handler';
import type {
    ProgressResponse,
    RequestProgress,
} from '@cache-server/http-handler/progress-response';
import type { JsonObject } from '@shared/utility/types/json-object';
import { Subject } from 'rxjs';
import type { AuthApi } from './auth/auth-api';

export class AuthHttpHandler {
    constructor(
        public readonly http: CustomHttpHandler,
        public readonly httpProgress: HttpProgressHandler,
        private readonly auth: AuthApi
    ) {}

    /**
     * Sends a get request
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> only e.g. '/users')
     * @param params
     * @param auth wether the user needs to be authenticated to make this request
     * @returns a Promise with the response
     */
    public async get<T>(path: string, params?: JsonObject, auth = true) {
        return this.ifAuthenticated(auth).then(async (token) =>
            this.http.get<T>(path, params, token)
        );
    }

    /**
     * Sends a get request
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> only e.g. '/users')
     * @param params
     * @param auth wether the user needs to be authenticated to make this request
     * @param responseType the expected response type of the xmlhttp request
     */
    public getWithProgress<T>(
        path: string,
        params?: JsonObject,
        auth = true,
        responseType?: XMLHttpRequestResponseType
    ): ProgressResponse<T> {
        return this.getProgressResponseAuthenticated(auth, (token) =>
            this.httpProgress.get<T>(path, params, token, responseType)
        );
    }

    /**
     * Sends a post request (create data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param auth wether the user needs to be authenticated to make this request
     * @returns a Promise with the response
     */
    public async post<T>(path: string, body: JsonObject, auth = true) {
        return this.ifAuthenticated(auth).then(async (token) =>
            this.http.post<T>(path, body, token)
        );
    }

    /**
     * Sends a post request (create data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param auth wether the user needs to be authenticated to make this request
     */
    public postWithProgress<T>(
        path: string,
        body: JsonObject,
        auth = true
    ): ProgressResponse<T> {
        return this.getProgressResponseAuthenticated(auth, (token) =>
            this.httpProgress.post<T>(path, body, token)
        );
    }

    /**
     * Sends a put request (edit data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @returns a Promise with the response
     */
    public async put<T>(path: string, body: JsonObject) {
        return this.ifAuthenticated(true).then(async (token) =>
            this.http.put<T>(path, body, token)
        );
    }

    /**
     * Sends a put request (edit data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     */
    public putWithProgress<T>(path: string, body: Blob): ProgressResponse<T> {
        return this.getProgressResponseAuthenticated(true, (token) =>
            this.httpProgress.put<T>(path, body, token!)
        );
    }

    /**
     * Sends a delete request
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @returns a Promise with the response
     */
    public async delete<T>(path: string, body: JsonObject) {
        return this.ifAuthenticated(true).then(async (token) =>
            this.http.delete<T>(path, body, token)
        );
    }

    /**
     * Converts a request with progress to one delayed until the user has authenticated himself
     */
    private getProgressResponseAuthenticated<T>(
        auth: boolean,
        sendRequest: (token?: string) => ProgressResponse<T>
    ): ProgressResponse<T> {
        const progress$ = new Subject<RequestProgress>();
        const data = this.ifAuthenticated(auth).then(async (token) => {
            const r = sendRequest(token);
            r.progress$.subscribe(progress$);
            return r.data;
        });
        return {
            progress$,
            data,
        };
    }

    /**
     * @returns a promise that resolves if and when the user should be/is authenticated
     */
    private ifAuthenticated(auth: true): Promise<string>;
    private ifAuthenticated(auth: false): Promise<undefined>;
    private ifAuthenticated(auth: boolean): Promise<string | undefined>;
    private async ifAuthenticated(auth: boolean) {
        if (auth) {
            return this.auth.whenAuthenticated();
        }
        return Promise.resolve(undefined);
    }
}
