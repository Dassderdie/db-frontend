import type { CacheConversation } from '@cache-server/cache-conversation';
import type { CacheServer } from '@cache-server/cache-server';
import type { ClientChannel } from '@cache-server/client-channel';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export interface CacheClient {
    message$: Observable<CacheConversation['response']>;
    postMessage: (message: CacheConversation['message']) => void;
}

export class FallbackCacheClient implements CacheClient {
    private readonly ownClientChannel: ClientChannel = {
        id: '0',
        // TODO: actually transmit the transferable object (files...)
        postMessage: (response: CacheConversation['response'], transfer?: []) =>
            // copy the response to mimic the postMessage-spec
            this.messageE$.next(JSON.parse(JSON.stringify(response))),
    };
    private cacheServer?: CacheServer;
    private readonly messageE$ = new Subject<CacheConversation['response']>();
    public readonly message$ = this.messageE$.asObservable();
    /**
     * Lazy loads the cache-server
     * The fallback is only rarely needed, therefore we can often reduce the bundle size by importing it dynamically
     */
    private async getCacheServer() {
        return (
            this.cacheServer ??
            import('@cache-server/cache-server').then((module) => {
                this.cacheServer = new module.CacheServer();
                return this.cacheServer;
            })
        );
    }

    public async postMessage(
        message: CacheConversation['message']
    ): Promise<void> {
        (await this.getCacheServer()).handleMessage(
            // copy the message to mimic the postMessage-spec
            JSON.parse(JSON.stringify(message)),
            this.ownClientChannel
        );
    }
}
