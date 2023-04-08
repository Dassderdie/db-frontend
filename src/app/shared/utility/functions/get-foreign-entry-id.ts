import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { getForeignEntryAttributeIds } from './get-foreign-entry-attribute-ids';

/**
 * @returns the entryId of the foreign table
 */
export function getForeignEntryId(
    values: Version['values'],
    foreign: boolean,
    intermediateTable: IntermediateTable,
    tableId: UUID,
    attributeId: UUID
): UUID {
    if (values) {
        return values[
            getForeignEntryAttributeIds(
                intermediateTable,
                tableId,
                attributeId
            )[foreign ? 'foreignEntryAttributeId' : 'entryAttributeId']
        ] as UUID;
    }
    errors.error({
        message: 'values must not be undefined',
    });
    return '';
}
