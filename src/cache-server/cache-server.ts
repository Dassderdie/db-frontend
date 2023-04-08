import { SimpleStorage } from '@cache-server/storage/storage';
import packageInfo from 'package.json';
import { NEVER, of } from 'rxjs';
import {
    distinctUntilChanged,
    endWith,
    mergeScan,
    takeUntil,
} from 'rxjs/operators';
import type { ApiConversation } from './api/api-conversation';
import type { UUID } from './api/uuid';
import type {
    CacheConversation,
    CacheNormalConversation,
    ProgressConversation,
} from './cache-conversation';
import { Client } from './client';
import type { ClientChannel } from './client-channel';
import { CustomHttpHandler } from './http-handler/custom-http-handler';
import { HttpProgressHandler } from './http-handler/http-progress-handler';
import { SubscriptionsHandler } from './subscriptions-handler/subscriptions-handler';

const version = packageInfo.version;

export class CacheServer {
    private readonly storage = new SimpleStorage();
    private readonly http = new CustomHttpHandler();
    private readonly httpProgress = new HttpProgressHandler();

    private readonly subscriptionsHandler = new SubscriptionsHandler(
        this.storage,
        this.http,
        this.httpProgress
    );
    private readonly actionsHandler = this.subscriptionsHandler.actionsHandler;
    /**
     * All clients that have send a message to the service-worker and
     * are expected to be still alive
     */
    private readonly activeClients: {
        [clientId: string]: Client;
    } = {};

    public handleMessage(
        message: CacheConversation['message'],
        channel: ClientChannel
    ) {
        const clientId = channel.id;
        let client = this.activeClients[clientId];
        if (!client) {
            this.activeClients[clientId] = new Client(
                clientId,
                (
                    subscriptionId: UUID,
                    messageI: ApiConversation['subscribable']['message']
                ) =>
                    this.subscriptionsHandler.unsubscribe(
                        subscriptionId,
                        messageI
                    ),
                channel
            );
            client = this.activeClients[clientId]!;
            channel.postMessage({
                type: 'connect',
                messageId: message.id,
                version,
            });
            this.actionsHandler.auth.latestAuthEvent$
                .pipe(takeUntil(client.destroyed))
                .subscribe((data) =>
                    channel.postMessage({
                        type: 'isLoggedIn',
                        data,
                    })
                );
            client.progress$.subscribe((progressEvent) => {
                const progressResponse: ProgressConversation['response'] = {
                    type: 'progress',
                    data: progressEvent,
                };
                channel.postMessage(progressResponse);
            });
        }
        switch (message.type) {
            case 'connect':
                return;
            case 'subscribe': {
                client.addSubscription(message.id, message.action);
                const observables = this.subscriptionsHandler
                    // This observable completes when the client unsubscribes from it -> no memory leak
                    .subscribe(message.action, message.id);
                observables.data$.subscribe((data) =>
                    channel.postMessage({ ...message, data })
                );
                observables.error$.subscribe((error) => {
                    channel.postMessage({ type: 'error', error });
                });
                observables.progress$
                    .pipe(
                        // do not end with taskStarted
                        endWith('taskFinished' as const),
                        distinctUntilChanged(),
                        // when there was no 'taskStarted' before the 'taskFinished' nothing should be emitted
                        mergeScan(
                            (previouse, next) =>
                                previouse !== 'taskStarted' &&
                                next === 'taskFinished'
                                    ? NEVER
                                    : of(next),
                            undefined as
                                | 'taskFinished'
                                | 'taskStarted'
                                | undefined
                        )
                    )
                    // only the next call is relevant (this stream should not end the progressSubject of the whole client)
                    .subscribe((e) => client!.progress$.next(e!));
                break;
            }
            case 'unsubscribe':
                client.removeSubscription(message.data.subscriptionId);
                channel.postMessage({
                    ...message,
                });
                break;
            case 'unsubscribeFromAll':
                this.removeClient(clientId);
                break;
            case 'renewItems':
                this.subscriptionsHandler
                    .renewItems()
                    .then((data) =>
                        channel.postMessage({
                            id: message.id,
                            type: message.type,
                            action: message.action,
                            data: null,
                        })
                    )
                    .catch((error) =>
                        channel.postMessage({
                            id: message.id,
                            type: message.type,
                            action: message.action,
                            data: undefined,
                            error,
                        })
                    );
                break;
            default:
                client.progress$.next('taskStarted');
                this.actionsHandler
                    .handleActions({
                        type: message.type,
                        action: message.action,
                    } as CacheNormalConversation['message'])
                    .then((data) =>
                        channel.postMessage({
                            ...message,
                            data,
                            // ts doesn't get that this is the right combination of data and type, action etc..
                        } as CacheNormalConversation['response'])
                    )
                    .catch((error) =>
                        channel.postMessage({
                            ...message,
                            error,
                        })
                    )
                    .finally(() => {
                        client!.progress$.next('taskFinished');
                    });
        }
    }

    private removeClient(clientId: string) {
        this.activeClients[clientId]!.destroy();
        delete this.activeClients[clientId];
    }
}
