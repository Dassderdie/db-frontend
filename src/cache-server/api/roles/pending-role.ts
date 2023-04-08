import type { UUID } from '@cache-server/api/uuid';

export interface PendingRole {
    readonly id: UUID;
    readonly projectId: UUID;
    readonly email: string;
    readonly declined?: boolean;
    readonly createdAt: string;
    readonly creatorId: UUID;
}
