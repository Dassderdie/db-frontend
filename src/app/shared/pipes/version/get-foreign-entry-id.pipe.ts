import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { getForeignEntryId } from '@shared/utility/functions/get-foreign-entry-id';

@Pipe({
    name: 'getForeignEntryId',
})
export class GetForeignEntryIdPipe implements PipeTransform {
    transform(
        values: Version['values'],
        foreign: boolean,
        intermediateTable: IntermediateTable,
        tableId: UUID,
        attributeId: UUID
    ): UUID {
        return getForeignEntryId(
            values,
            foreign,
            intermediateTable,
            tableId,
            attributeId
        );
    }
}
