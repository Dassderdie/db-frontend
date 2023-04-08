import type { JsonObject } from '@shared/utility/types/json-object';
import { defaultApiBaseUrl } from './default-base-url';
import { getFullUrl } from './get-full-url';
import type { HttpResponse, HttpResponsePromise } from './http-response';

/**
 * A custom replacement for Angulars HttpClient, that also works in e.g. a service-worker
 * -> the functions work a bit differently than it tho...
 */
export class CustomHttpHandler {
    /**
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
     * @returns a Promise with the response
     */
    public async get<T>(
        path: string,
        params?: JsonObject,
        authToken?: string
    ): HttpResponsePromise<T> {
        return this.fetchRequest(
            'GET',
            this.baseUrl + path,
            params,
            undefined,
            authToken
        );
    }

    /**
     * Sends a post request (create data)
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param authToken the bearer token used for authentication (without 'Bearer ')
     * @returns a Promise with the response
     */
    public async post<T>(
        path: string,
        body: JsonObject,
        authToken?: string
    ): HttpResponsePromise<T> {
        return this.fetchRequest(
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
     * @returns a Promise with the response
     */
    public async put<T>(
        path: string,
        body: JsonObject,
        authToken: string
    ): HttpResponsePromise<T> {
        return this.fetchRequest(
            'PUT',
            this.baseUrl + path,
            undefined,
            JSON.stringify(body),
            authToken
        );
    }

    /**
     * Sends a delete request
     * @param path the endpoint of the server the request should go to
     * (excluding the base url -> '/users')
     * @param body
     * @param authToken the bearer token used for authentication (without 'Bearer ')
     * @returns a Promise with the response
     */
    public async delete<T>(
        path: string,
        body: JsonObject,
        authToken: string
    ): HttpResponsePromise<T> {
        return this.fetchRequest(
            'DELETE',
            this.baseUrl + path,
            undefined,
            JSON.stringify(body),
            authToken
        );
    }

    private async fetchRequest<T>(
        method: 'DELETE' | 'GET' | 'POST' | 'PUT',
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
        authToken?: string
    ): HttpResponsePromise<T> {
        const fullUrl = getFullUrl(url, params);
        const headers: { [key: string]: string } = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
        }
        // Set timeout
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.timeout);
        const rawResponse = body
            ? await fetch(fullUrl, {
                  method,
                  headers,
                  body,
                  signal: controller.signal,
              })
            : // To fix: "Request with (GET or DELETE)/HEAD method cannot have body"
              await fetch(fullUrl, {
                  method,
                  headers,
                  signal: controller.signal,
              });
        return this.getData<HttpResponse<T>>(rawResponse.body).then(
            (response) => {
                if (response.status === 200 && !response.error) {
                    return response;
                }
                throw response as any;
            },
            (error) => {
                if (rawResponse.status > 400) {
                    throw Error(
                        `HTTP ERROR: ${rawResponse.status}: ${rawResponse.statusText} \n ${error}`
                    );
                }
                throw error;
            }
        );
    }

    /**
     * See https://stackoverflow.com/a/59201294
     */
    private async getData<T>(
        stream: ReadableStream<Uint8Array> | null
    ): Promise<T> {
        if (!stream) {
            throw Error('no Stream provided');
        }
        const reader = stream.getReader();
        const utf8Decoder = new TextDecoder();
        let nextChunk;
        let resultStr = '';
        // eslint-disable-next-line no-await-in-loop
        while (!(nextChunk = await reader.read()).done) {
            const partialData = nextChunk.value;
            resultStr += utf8Decoder.decode(partialData);
        }
        try {
            return JSON.parse(resultStr);
        } catch (error: unknown) {
            throw Error(`${resultStr}\n\n ${error}`);
        }
    }
}
