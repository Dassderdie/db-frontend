import type { UUID } from '@cache-server/api/uuid';
import type { FileErrors } from './files-errors';

export interface PresentFile {
    blobId: UUID;
    blobInformation: {
        rawSize: number;
        creatorId: UUID;
    };
    /**
     * The new fileName
     */
    changedFileName?: string;
    errors?: FileErrors;
    /**
     * Wether the file should get deleted
     */
    deleted?: true;
}
