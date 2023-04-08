import type { AuthApi } from '@cache-server/api/auth/auth-api';
import type { UUID } from '@cache-server/api/uuid';
import type { JsonObject } from '@shared/utility/types/json-object';
import type { Observable } from 'rxjs';
import { EMPTY, from, ReplaySubject, Subject } from 'rxjs';
import { filter, first, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

export class WebSocketClient {
    /**
     * Emits always when the webSocket connects (= open & authenticated) closes or errors
     */
    private readonly connectionStateE$ = new Subject<ConnectionState>();
    /**
     * Emits always the current WebSocket State:
     * connected (= open & authenticated) closed or error
     */
    public readonly connectionState$: Observable<ConnectionState>;
    /**
     * The minimum number of ms to wait until reconnecting the websocket
     * reconnectTimeout = (2^numberOfReconnectAttempts * reconnectTimeoutFactor)
     */
    private readonly reconnectTimeoutFac = 1000;
    /**
     * The time until a reconnectAttempt is "forgotten" (in ms)
     */
    private readonly reconnectTimeoutResetTime = 10 * 60 * 1000;
    /**
     * The number of reconnectAttempts in the last reconnectTimeoutResetTime
     */
    private numberOfReconnectAttempts = 0;
    /**
     * A subject that emits the current token always when the connection is authenticated
     * else it emits undefined
     */
    private readonly isAuthenticated$ = new ReplaySubject<string | undefined>(
        1
    );
    /**
     * wether the user is/should be currently not logged in (to determine wether the socket should reconnect on close)
     */
    private loggedOut = true;
    private socket?: WebSocket;

    /**
     * A dictionary where the key is the requestId and at the same time
     * the id of the response and the value is a subject that emits all the responses with this responseId
     */
    private readonly requests: {
        [requestId: string]: Subject<JsonObject | null | undefined>;
    } = {};

    private readonly eventListeners: Parameters<
        WebSocket['addEventListener']
    >[] = [
        ['open', (event) => this.onOpenHandler(event), { once: true }],
        ['message', (event) => this.onMessageHandler(event as MessageEvent)],
        ['error', (event) => this.onErrorHandler(event), { once: true }],
        [
            'close',
            (event) => this.onCloseHandler(event as CloseEvent),
            { once: true },
        ],
    ];

    constructor(private readonly auth: AuthApi) {
        const connectionStateE$ = new ReplaySubject<ConnectionState>(1);
        this.connectionStateE$.subscribe(connectionStateE$);
        this.connectionState$ = connectionStateE$.asObservable();

        this.auth.authEvent$.subscribe((event) => {
            switch (event) {
                case 'logged-in':
                    this.loggedOut = false;
                    this.connect();
                    break;
                case 'renew-login':
                    break;
                case 'logout':
                    this.loggedOut = true;
                    this.close();
                    break;
                default:
                    errors.error({
                        message: `Unknown auth-event: ${event}`,
                        logValues: event,
                    });
            }
        });
    }

    /**
     * Sends a request over the websocket and makes sure the connection is authenticated
     * @returns a cold Observable that emits all the responses to the request
     *
     * important: to complete it and clean up everything related
     * cleanUpSource(requestId) has to be called
     */
    public sendAuthenticated<T extends JsonObject | null>(
        endpoint: string,
        data: JsonObject,
        requestId: UUID
    ): Observable<T> {
        // Delay until correctly authenticated (response from authentication)
        return from(this.whenAuthenticated()).pipe(
            switchMap((token) => this.send<T>(endpoint, token, data, requestId))
        );
    }

    /**
     * @returns an observable that emits all responses with the specified id
     * important: to complete it and clean up everything related
     * cleanUpSource(responseId) has to be called
     */
    public listenToResponses<T extends JsonObject | null>(
        responseId: UUID
    ): Observable<T> {
        if (!this.requests[responseId]) {
            this.requests[responseId] = new Subject();
        }
        return this.requests[responseId]!.asObservable() as Observable<T>;
    }

    public cleanUpSource(requestId: UUID) {
        if (!this.requests[requestId]) {
            // When the socket is closed all requests etc. will already be gone
            // -> it is intended to try to clean stuff up here
            return;
        }
        this.requests[requestId]!.complete();
        delete this.requests[requestId];
    }

    /**
     * @returns a Promise that resolves to the current token when the user is successful authenticated
     */
    private async whenAuthenticated(): Promise<string> {
        return (
            this.isAuthenticated$
                .pipe(
                    filter((auth) => typeof auth === 'string'),
                    first()
                )
                // if all not string values are filtered, the emitted value must be string
                .toPromise() as Promise<string>
        );
    }

    /**
     * sends a request over the websocket
     * @returns an Observable that emits all the responses to the request
     *
     * important: to complete it and clean up everything related
     * cleanUpSource(requestId) has to be called
     */
    private send<T extends JsonObject | null>(
        endpoint: string,
        token: string,
        data: JsonObject,
        requestId: UUID
    ): Observable<T> {
        // if the socket reconnects this request can be carried out after the reconnection
        const request$ = (this.requests[requestId] = new Subject<any>());
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            errors.error({
                message:
                    "The socket isn't open. The request will not be carried out.",
                logValues: {
                    socket: this.socket,
                    // eslint-disable-next-line prefer-rest-params
                    arguments,
                },
                status: 'logWarning',
            });

            // reconnect() should be called in onCloseHandler() or onErrorHandler()
            return EMPTY;
        }
        this.socket.send(
            JSON.stringify({
                requestId,
                endpoint,
                token,
                data,
            })
        );
        return request$.asObservable();
    }

    /**
     * authenticate the websocket connection
     * @param token
     */
    private authenticate(token: string) {
        const requestId = uuidv4();
        this.send<null>('authenticate', token, {}, requestId).subscribe(
            (response) => {
                this.isAuthenticated$.next(token);
                // also completes this observable -> no first(), ...
                this.cleanUpSource(requestId);
            }
        );
    }

    /**
     * Reconnects the websocket
     */
    private reconnect() {
        this.close();
        this.numberOfReconnectAttempts++;
        setTimeout(
            () => this.numberOfReconnectAttempts--,
            this.reconnectTimeoutResetTime
        );
        const reconnectTimeout =
            Math.pow(2, this.numberOfReconnectAttempts) *
            this.reconnectTimeoutFac;
        setTimeout(() => {
            errors.error({
                message: `Reconnecting the WebSocket in ${
                    reconnectTimeout / 1000
                }s …`,
                status: 'logWarning',
            });

            if (!this.loggedOut) {
                this.auth.whenAuthenticated().then((token) => {
                    errors.error({
                        message: `Reconnecting the WebSocket`,
                        status: 'logWarning',
                    });
                    this.connect();
                });
            }
        }, reconnectTimeout);
    }

    private close() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
        for (const eventHandler of this.eventListeners) {
            this.socket.removeEventListener(...eventHandler);
        }
        for (const requestId of Object.keys(this.requests)) {
            // cleanUp all requests
            this.cleanUpSource(requestId);
        }
    }

    private connect() {
        // only connect if the user is loggedIn
        if (!this.auth.token) {
            return;
        }
        if (environment.enableWss) {
            // Use wss only in production
            this.socket = new WebSocket(`wss://${location.host}/api/v1`);
        } else {
            this.socket = new WebSocket(`ws://${location.host}/api/v1`);
        }
        for (const eventHandler of this.eventListeners) {
            this.socket.addEventListener(...eventHandler);
        }
        this.whenAuthenticated().then((token) => {
            this.connectionStateE$.next('connected');
            // this.requests should be empty
        });
    }

    private onOpenHandler(event: Event) {
        this.auth.token$
            .pipe(
                takeUntil(
                    this.connectionStateE$.pipe(
                        filter((e) => e === 'closed' || e === 'error')
                    )
                )
            )
            .subscribe((token) => {
                if (token) {
                    this.authenticate(token);
                }
            });
    }

    private onMessageHandler(event: MessageEvent) {
        const response: {
            id: UUID;
            type: 'response' | 'subscriptionMessage';
            data: {
                status: number;
                data: any;
                error?: any;
            };
        } = JSON.parse(event.data);
        if (
            response.data.status !== 200 ||
            response.data.error ||
            response.data.data === undefined
        ) {
            errors.error({
                message: 'websocket response has an error',
                logValues: { response },
            });
            return;
        }
        const request$ = this.requests[response.id];
        if (!request$) {
            // ignore subscribed-message backend #202
            if (
                response.type === 'subscriptionMessage' &&
                response.data.data?.message !== 'subscribed'
            ) {
                errors.error({
                    message: `Unknown responseId: ${response.id}`,
                    logValues: { response },
                });
            }
            return;
        }
        request$.next(response.data.data);
    }

    private onCloseHandler(event: CloseEvent) {
        this.connectionStateE$.next('closed');
        this.isAuthenticated$.next(undefined);
        if (!this.loggedOut) {
            this.reconnect();
        } else {
            errors.error({
                message: `The following requests from the websocket are still pending:`,
                logValues: this.requests,
                status: 'logWarning',
            });
        }
    }

    private onErrorHandler(event: Event) {
        this.connectionStateE$.next('error');
        this.isAuthenticated$.next(undefined);
        this.reconnect();
    }
}

type ConnectionState = 'closed' | 'connected' | 'error';
