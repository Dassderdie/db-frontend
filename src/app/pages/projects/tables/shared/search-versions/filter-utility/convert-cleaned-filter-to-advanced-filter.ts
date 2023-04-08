import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { emptyFilterGroup } from './empty-filter-group';

export function convertCleanedFilterToAdvancedFilter(
    filterGroup: FilterGroup | null | undefined
): FilterGroup {
    return filterGroup ?? emptyFilterGroup;
}
