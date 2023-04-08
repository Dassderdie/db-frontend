import type { UUID } from '@cache-server/api/uuid';
import type { FileErrors } from './files-errors';

export interface NewFile {
    blob: Blob;
    /**
     * the id of the blob if it was already uploaded to the server
     */
    blobId?: UUID;
    blobInformation: {
        rawSize: number;
    };
    errors?: FileErrors;
}
