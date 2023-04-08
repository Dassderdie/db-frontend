import type { JsonObject } from '@shared/utility/types/json-object';
import { Subject } from 'rxjs';
import { defaultApiBaseUrl } from './default-base-url';
import { getFullUrl } from './get-full-url';
import type { ProgressResponse, RequestProgress } from './progress-response';

/**
 * CustomHttpHandler but for requests where you want to see the progress of the request
 * (especially up-/downloading blobs)
 */
export class HttpProgressHandler {
    /**
     * TODO:
     * The response timeout after which a request is canceled
     */
    private readonly timeout = 30 * 1000;

    constructor(private readonly baseUrl = defaultApiBaseUrl) {}

    /**
     * Sends a get request
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> only e.g. '/users')
     * @param params
     * @param authToken the bearer token used for authentication (without 'Bearer ')
     * @param responseType the expected response type of the xmlhttp request
     */
    public get<T>(
        path: string,
        params?: JsonObject,
        authToken?: string,
        responseType?: XMLHttpRequestResponseType
    ): ProgressResponse<T> {
        return this.requestProgress(
            'GET',
            this.baseUrl + path,
            params,
            undefined,
            authToken,
            responseType
        );
    }

    /**
     * Sends a post request (create data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param authToken the bearer token used for authentication (without 'Bearer ')
     */
    public post<T>(
        path: string,
        body: JsonObject,
        authToken?: string
    ): ProgressResponse<T> {
        return this.requestProgress(
            'POST',
            this.baseUrl + path,
            undefined,
            JSON.stringify(body),
            authToken
        );
    }

    /**
     * Sends a put request (edit data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param authToken the bearer token used for authentication (without 'Bearer ')
     */
    public put<T>(
        path: string,
        body: Blob,
        authToken: string
    ): ProgressResponse<T> {
        return this.requestProgress(
            'PUT',
            this.baseUrl + path,
            undefined,
            body,
            authToken
        );
    }

    private requestProgress<T>(
        method: 'GET' | 'POST' | 'PUT',
        url: string,
        params?: JsonObject,
        body?:
            | ArrayBuffer
            | ArrayBufferView
            | Blob
            | FormData
            | ReadableStream<Uint8Array>
            | URLSearchParams
            | string
            | null
            | undefined,
        authToken?: string,
        responseType: XMLHttpRequestResponseType = ''
    ): ProgressResponse<T> {
        const xhr = new XMLHttpRequest();
        xhr.open(method, getFullUrl(url, params));
        xhr.responseType = responseType;
        if (authToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        }
        const progress$ = new Subject<RequestProgress>();
        xhr.addEventListener('progress', (event) => {
            progress$.next({ loaded: event.loaded, total: event.total });
        });
        const data = new Promise<T>((resolve, reject) => {
            xhr.addEventListener('load', (event) => {
                if (xhr.status !== 200) {
                    reject(
                        Error(`HTTP ERROR: ${xhr.status}: ${xhr.responseText}`)
                    );
                } else {
                    resolve(xhr.response);
                }
            });
        });
        xhr.send(body);
        return {
            progress$,
            data,
        };
    }
}
