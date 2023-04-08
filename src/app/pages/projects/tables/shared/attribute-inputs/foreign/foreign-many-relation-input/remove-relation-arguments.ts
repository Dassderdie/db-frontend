import type { UUID } from '@cache-server/api/uuid';

export interface RemoveRelationArguments {
    intermediateEntryId: UUID;
    foreignEntryId: UUID;
}
