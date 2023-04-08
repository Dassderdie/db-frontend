import { getFileMimeType } from '@cache-server/api/blobs/get-file-mime-type';
import { setBlobType } from '@cache-server/api/blobs/set-blob-type';
import type { HttpResponse } from '@cache-server/http-handler/http-response';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { AuthApi } from '../auth/auth-api';
import type { UUID } from '../uuid';
import { BlobCache } from './blob-cache';
import type { UploadedBlob } from './uploaded-blob';

export class BlobsApi extends Api {
    private readonly blobCache = new BlobCache();

    constructor(private readonly authHttp: AuthHttpHandler, auth: AuthApi) {
        super();
        auth.authEvent$.subscribe((e) => {
            if (e === 'logout') {
                // reset cache
                this.blobCache.reset();
            }
        });
    }

    // TODO: display progress
    public async downloadBlob(options: {
        blobId: UUID;
        raw: boolean;
        fileName: string;
    }) {
        const cachedBlob = this.blobCache.get(options.blobId);
        if (cachedBlob) {
            // update the blobs type if necessary
            setBlobType(cachedBlob, options.fileName);
            return cachedBlob;
        }
        // get the blob from the server
        return this.authHttp
            .getWithProgress<string>(
                '/blobs/download',
                options,
                undefined,
                'blob'
            )
            .data.then((fileBinary) => {
                const blob = new Blob([fileBinary], {
                    type: getFileMimeType(options.fileName),
                });
                this.blobCache.add(options.blobId, blob);
                return blob;
            });
    }

    /**
     * @returns the blobId of the newly uploaded blob
     */
    public async uploadBlob(options: { blob: Blob }) {
        const createResponse = await this.authHttp.post<{
            blob: UploadedBlob;
        }>('/blobs', {
            rawSize: options.blob.size,
        });
        const blobSlot = createResponse.data.blob;
        const upload = this.authHttp.putWithProgress<
            HttpResponse<{
                blob: UploadedBlob;
            }>
        >(`/blobs/upload/${blobSlot.id}`, options.blob);
        // TODO: progress
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const uploadResponse = await upload.data;
        const blob: Blob = options.blob;
        this.blobCache.add(blobSlot.id, blob);
        return blobSlot.id;
    }
}
