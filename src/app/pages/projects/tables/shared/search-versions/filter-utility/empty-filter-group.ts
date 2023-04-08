import type { FilterGroup } from '@cache-server/api/versions/filter-group';

export const emptyFilterGroup: FilterGroup = {
    type: 'and',
    expressions: [],
};
