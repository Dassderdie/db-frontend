import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { isEqual } from 'lodash-es';
import { isWrappedByNormalFilter } from './is-wrapped-by-normal-filter';
import { normalWrapFilter } from './normal-wrap-filter';

/**
 * parses the provided advancedFilter to the form of an not advanced filter
 * considering advancedMode
 * private (public only for unit tests)
 * @param advancedFilter
 * @returns the new editFilter
 */
export function convertAdvancedToNormalFilter(
    advancedFilter: FilterGroup
): DeepWritable<FilterGroup> {
    // Check wether the only editable expression is a filterGroup
    if (isWrappedByNormalFilter(advancedFilter)) {
        const lastExpression =
            advancedFilter.expressions[advancedFilter.expressions.length - 1]!;
        // Return the one filterGroup that has been added to the expressions of the normalWrapFilter
        return cloneDeepWritable(lastExpression as FilterGroup);
    }
    if (
        advancedFilter.type === normalWrapFilter.type &&
        normalWrapFilter.expressions.every((normalExpression, i) =>
            isEqual(advancedFilter.expressions[i], normalExpression)
        )
    ) {
        return {
            type: normalWrapFilter.type,
            expressions: cloneDeepWritable(
                advancedFilter.expressions.slice(
                    normalWrapFilter.expressions.length
                )
            ),
        };
    }
    // this conversion is not lossless
    return cloneDeepWritable(advancedFilter);
}
