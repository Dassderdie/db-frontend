import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';

export function getNewestVersionFilter(entryId: UUID): FilterGroup {
    return {
        type: 'and',
        expressions: [
            {
                type: 'equal',
                value: entryId,
                key: 'entryId',
            },
            {
                type: 'equal',
                value: null,
                key: 'invalidatedAt',
            },
        ],
    };
}
