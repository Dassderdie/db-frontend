import type { DefaultTable } from '@cache-server/api/tables/table';
import type { Version } from '@cache-server/api/versions/version';

export function getVersionDisplayName(
    table: DefaultTable,
    version: Version
): string {
    errors.assert(table.id === version.tableId);
    const firstAttribute = table.attributes[0]!;
    switch (firstAttribute.kind) {
        case 'boolean':
        case 'date':
        case 'date-time':
        case 'time':
        case 'email':
        case 'number':
        case 'string':
        case 'url':
            return version.values[firstAttribute.id]?.toLocaleString() ?? '';
        case 'files':
        case 'foreign':
        default:
            return '???';
    }
}
