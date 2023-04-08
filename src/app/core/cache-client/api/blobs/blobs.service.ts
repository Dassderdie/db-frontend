import { Injectable } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import { CacheClientService } from '@core/cache-client/cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class BlobsService {
    constructor(private readonly cacheClientService: CacheClientService) {}

    /**
     * Lists all projects the currently authenticated user has access to
     */
    public async getBlob(blobId: UUID, fileName: string, raw: boolean) {
        return this.cacheClientService.handleAction({
            type: 'blobs',
            action: {
                kind: 'downloadBlob',
                options: {
                    blobId,
                    fileName,
                    raw,
                },
            },
        });
    }
}
