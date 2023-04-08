import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import type { ForeignInputValues } from '../foreign/foreign-input-value';

@Pipe({
    name: 'singleForeignEntryId',
})
export class SingleForeignEntryIdPipe implements PipeTransform {
    /**
     * @returns the current foreignEntryId or undefined if the value is null
     */
    transform(
        value: ForeignInputValues,
        foreignAttributeId: UUID,
        intermediateVersion: Version | null
    ) {
        if (value.newRelations[0]) {
            return value.newRelations[0].foreignEntryId;
        }
        for (const changedRelation of Object.values(value.changedRelations)) {
            if (!changedRelation.delete) {
                return changedRelation.foreignEntryId;
            }
        }
        if (
            intermediateVersion &&
            value.changedRelations[intermediateVersion.entryId]?.delete !== true
        ) {
            return intermediateVersion.values[foreignAttributeId] as UUID;
        }
        return undefined;
    }
}
