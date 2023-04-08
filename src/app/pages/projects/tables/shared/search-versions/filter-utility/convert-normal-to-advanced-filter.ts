import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { normalWrapFilter } from './normal-wrap-filter';

/**
 * @returns the advanced filter inferred by the provided filter
 */
export function convertNormalToAdvancedFilter(
    filter: FilterGroup
): DeepWritable<FilterGroup> {
    const advancedFilter = cloneDeepWritable(normalWrapFilter);
    if (filter) {
        advancedFilter.expressions.push(cloneDeepWritable(filter));
    }
    return advancedFilter;
}
