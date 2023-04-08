/* eslint-disable no-console */
import type { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { Version } from '@cache-server/api/versions/version';
import type { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import { presentForeignRelationsFilter } from './present-foreign-relations-filter';

export function getPresentForeignRelations(
    versionsService: VersionsService,
    intermediateTable: IntermediateTable,
    version: Version,
    attribute: ForeignAttribute
) {
    errors.assert(
        attribute.kindOptions.intermediateTableId === intermediateTable.id,
        { message: 'invalid intermediateTable', status: 'error' }
    );
    const versionFilter = JSON.stringify(
        presentForeignRelationsFilter(
            getForeignEntryAttributeIds(
                intermediateTable!,
                version.tableId,
                attribute.id
            ).entryAttributeId,
            version
        )
    );
    return versionsService.getVersions(
        version.projectId,
        attribute.kindOptions.intermediateTableId,
        versionFilter
    );
}
