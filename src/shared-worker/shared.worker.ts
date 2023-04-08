import type { UUID } from '@cache-server/api/uuid';
import type { CacheConversation } from '@cache-server/cache-conversation';
import { CacheServer } from '@cache-server/cache-server';
import type { ClientChannel } from '@cache-server/client-channel';
import { ErrorsManager } from '@core/utility/errors/errors-manager';
import { makeCloneable } from '@shared/utility/functions/make-cloneable';
import { v4 as uuid4 } from 'uuid';
import { heartBeatTimeout } from './heartbeat-timeout';
import type {
    ErrorsConversation,
    SharedWorkerConversation,
} from './shared-worker-conversation';
import type { SharedWorkerGlobalScope } from './shared-worker-typings';

/**
 * The shared worker that should be deployed on development and production
 */

console.log('Shared worker started!');

declare global {
    /**
     * The object used for custom error handling
     * - you can use it in any components to easily e.g.
     * throw errors and inform the user / developer about it
     */
    const errors: ErrorsManager;
}
const service = self as unknown as SharedWorkerGlobalScope & {
    cacheServer: CacheServer;
    ports: {
        [id: string]: {
            channel: ClientChannel;
            /**
             * When the last message came from this port -> if undefined he should be considered dead -> clean up
             */
            lastLifeSignAt?: number;
        };
    };
    errors: ErrorsManager;
};
service.ports = {};
service.cacheServer = new CacheServer();
service.errors = new ErrorsManager();

/**
 * if a client hasn't send any sign of life for this time he will get cleaned up
 */
const maxLifetimeWithoutSign = 2 * heartBeatTimeout + 10 * 1000;
function destroyClient(portId: UUID) {
    service.cacheServer.handleMessage(
        {
            id: uuid4(),
            type: 'unsubscribeFromAll',
        },
        service.ports[portId]!.channel
    );
    delete service.ports[portId];
}
// Remove clients that are no longer connected, but didn't unsubscribe
// (to keep the service working smoothly even if a browser/tab didn't work like expected)
setInterval(
    () => {
        for (const [portId, port] of Object.entries(service.ports)) {
            if (
                !port.lastLifeSignAt ||
                port.lastLifeSignAt < Date.now() - maxLifetimeWithoutSign
            ) {
                // remove the client
                errors.error({
                    status: 'logWarning',
                    message: `The client ${portId} didn't send 'destroy' before he terminated. This could be, because the browser put it to sleep.`,
                });
                destroyClient(portId);
            }
        }
    },
    // repeat this check regularly
    maxLifetimeWithoutSign + 60 * 1000
);

service.onconnect = (e) => {
    const clientPort = e.ports[0]!;
    clientPort.onmessage = (
        event: Omit<MessageEvent, 'data'> & {
            data: SharedWorkerConversation['message'];
        }
    ) => {
        const message = event.data;
        if (!message.clientId) {
            return;
        }
        const channel: ClientChannel = {
            id: message.clientId,
            postMessage: (r: CacheConversation['response']) => {
                const response: SharedWorkerConversation['response'] = {
                    type: 'normal',
                    data: r,
                };
                clientPort.postMessage(response);
            },
        };
        switch (message.type) {
            case 'destroyed':
                destroyClient(message.clientId);
                return;
            case 'normal':
                service.cacheServer.handleMessage(message.data, channel);
                break;
            case 'heartbeat':
                break;
            default:
        }
        // we know that the client is still alive
        service.ports[message.clientId] = {
            channel,
            lastLifeSignAt: Date.now(),
        };
    };
    service.errors.errors$.subscribe((error) => {
        const errorResponse: ErrorsConversation['response'] = {
            type: 'error',
            error: {
                ...error,
                error: makeCloneable(error.error),
                logValues: makeCloneable(error.logValues),
            },
        };
        clientPort.postMessage(errorResponse);
    });
};
