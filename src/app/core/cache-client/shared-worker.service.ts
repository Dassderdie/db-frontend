import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { CacheConversation } from '@cache-server/cache-conversation';
import { MessageService } from '@core/utility/messages/message.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { heartBeatTimeout } from 'src/shared-worker/heartbeat-timeout';
import type {
    DestroyedConversation,
    HeartbeatConversation,
    SharedWorkerConversation,
} from 'src/shared-worker/shared-worker-conversation';
import { v4 as uuid4 } from 'uuid';
import type { CacheClient } from './cache-client';

@Injectable({
    providedIn: 'root',
})
export class SharedWorkerService {
    constructor(private readonly messageService: MessageService) {
        if (!this.sharedWorkerIsAvailable()) {
            // to make sure that this message is only shown, when more than one tab is open
            //  See https://stackoverflow.com/a/43291970 for more information
            const openTabKey = 'openTab';
            const tabAvailable = 'tabAvailable';
            localStorage[openTabKey] = Date.now();
            window.addEventListener(
                'storage',
                (e) => {
                    if (e.key === openTabKey) {
                        // Emit that you're already available.
                        localStorage[tabAvailable] = Date.now();
                    }
                    if (e.key === tabAvailable) {
                        this.messageService.postMessage(
                            {
                                title: _(
                                    'messages.shared-worker-fallback.title'
                                ),
                                body: _('messages.shared-worker-fallback.body'),
                                color: 'warning',
                            },
                            'alert',
                            30 * 1000
                        );
                    }
                },
                false
            );
        }
    }

    /**
     * Tries to create a CacheClient living in a shared-worker
     */
    public createSharedWorkerClient(): CacheClient | undefined {
        if (!this.sharedWorkerIsAvailable()) {
            errors.error({
                message: "This browser doesn't support Shared-workers",
                status: 'logWarning',
            });
            return undefined;
        }
        let sharedWorker: SharedWorker;
        try {
            sharedWorker = new SharedWorker(
                new URL(
                    '../../../shared-worker/shared.worker.ts',
                    import.meta.url
                ) as any,
                {
                    credentials: 'same-origin',
                    type: 'module',
                }
            );
        } catch {
            errors.error({
                message: "This browser doesn't support Shared-workers",
                status: 'logWarning',
            });
            return undefined;
        }
        sharedWorker.onerror = (e: ErrorEvent) =>
            errors.error({
                message: 'SharedWorker has an error',
                logValues: e,
            });
        const clientId = uuid4();
        // send regularly heartbeat messages to assure that this tab is still open
        const heartbeatMessage: HeartbeatConversation['message'] = {
            clientId,
            type: 'heartbeat',
        };
        setInterval(() => {
            sharedWorker.port.postMessage(heartbeatMessage);
        }, heartBeatTimeout);
        const responseE$ = new Subject<CacheConversation['response']>();
        sharedWorker.port.onmessage = (
            event: Omit<MessageEvent, 'data'> & {
                data: SharedWorkerConversation['response'];
            }
        ) => {
            const response = event.data;
            switch (response.type) {
                case 'normal':
                    responseE$.next(response.data);
                    break;
                case 'error':
                    errors.error(response.error);
                    break;
                default:
                    errors.error({
                        message: `Unknown response type`,
                        logValues: { response },
                    });
                    break;
            }
        };
        // No port.start(), because it is already triggered by setter of .onmessage
        // unregister the client when this window is closed
        window.onunload = () => {
            const m: DestroyedConversation['message'] = {
                clientId,
                type: 'destroyed',
            };
            sharedWorker.port.postMessage(m);
        };
        return {
            message$: responseE$.asObservable(),
            postMessage: (message: CacheConversation['message']) => {
                const m: SharedWorkerConversation['message'] = {
                    clientId,
                    type: 'normal',
                    data: message,
                };
                sharedWorker.port.postMessage(m);
            },
        };
    }

    private sharedWorkerIsAvailable() {
        return (
            environment.sharedWorkerCache && typeof SharedWorker !== 'undefined'
        );
    }
}
