import type { UUID } from '../uuid';

/**
 * Blobs are cached in here and not in the subscriptionHandler because
 * Blobs are immutable -> a blob is never outdated/should never get renewed
 * the limiting factor for the cache is mainly it's size
 */
export class BlobCache {
    private cachedBlobs: {
        [blobId: string]: CachedBlob;
    } = {};
    private blobCacheSize = 0;
    /**
     * An array of blobIds (Object.keys(this.cachedBlobs))
     * sorted after the lastUsedAt (old to new)
     */
    private lastUsedBlobIds: UUID[] = [];
    /**
     * The maximum size until which blobs should be cached (= 5MB)
     */
    private readonly maxCacheSize = 5 * 1024 * 1024 * 8 * 1000;
    /**
     * The maximum time (in ms) that a blob should be kept in the cache
     */
    private readonly maxAge = 20 * 60 * 1000;

    constructor() {
        setInterval(() => this.clean(), 10 * 60 * 1000);
    }

    /**
     * @returns the saved Blob or undefined, if not cached yet
     */
    public get(blobId: UUID) {
        const cachedBlob = this.cachedBlobs[blobId];
        if (cachedBlob) {
            cachedBlob.lastUsedAt = Date.now();
            // move the blobId to the front (newest)
            this.lastUsedBlobIds.splice(
                this.lastUsedBlobIds.indexOf(blobId),
                1
            );
            this.lastUsedBlobIds.push(blobId);
            return cachedBlob.blob;
        }
        return undefined;
    }

    /**
     * Stores the blob under the specified Id
     */
    public add(blobId: UUID, blob: Blob) {
        if (this.cachedBlobs[blobId]) {
            errors.error({
                message: `The blob ${blobId} has already been uploaded`,
            });
        }
        this.cachedBlobs[blobId] = { blob, lastUsedAt: Date.now() };
        this.lastUsedBlobIds.push(blobId);
        this.blobCacheSize += blob.size;
        // make place for this blob in the cache
        while (
            this.lastUsedBlobIds.length > 1 &&
            this.blobCacheSize > this.maxCacheSize
        ) {
            this.removeOldestBlob(this.lastUsedBlobIds[0]!);
        }
    }

    /**
     * Removes all cached blobs
     */
    public reset() {
        this.cachedBlobs = {};
        this.lastUsedBlobIds = [];
        this.blobCacheSize = 0;
    }

    private removeOldestBlob(blobId: UUID) {
        this.blobCacheSize -= this.cachedBlobs[blobId]!.blob.size;
        delete this.cachedBlobs[blobId];
        this.lastUsedBlobIds.shift();
    }

    /**
     * Removes cached blobs that have not been used for a too long time
     */
    private clean() {
        const now = Date.now();
        for (const blobId of this.lastUsedBlobIds) {
            const cachedBlob = this.cachedBlobs[blobId]!;
            if (now - cachedBlob.lastUsedAt < this.maxAge) {
                break;
            }
            this.removeOldestBlob(blobId);
        }
    }
}

interface CachedBlob {
    readonly blob: Blob;
    /**
     * The last date when this cached item has been retrieved time
     */
    lastUsedAt: number;
}
