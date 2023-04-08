import type { UUID } from '../uuid';

export interface UploadedBlob {
    id: UUID;
    variants: {
        raw?: {
            size: number;
            creationFinishedAt?: string;
            creationStartedAt?: string;
            deletedAt?: string;
        };
        rawZip?: {
            size?: number;
            creationFinishedAt?: string;
            creationStartedAt?: string;
            deletedAt?: string;
        };
    };
    allowRawDownload: boolean;
    creatorId: UUID;
    createdAt: string;
    updatedAt?: string;
    expiresAt?: string;
}
