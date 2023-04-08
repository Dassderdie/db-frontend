import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { isFilterGroup } from '@cache-server/api/versions/filter-group';
import { isEqual } from 'lodash-es';
import { normalWrapFilter } from './normal-wrap-filter';

/**
 * @returns wether the provided filter is wrapped by the normalWrapFilter
 */
export function isWrappedByNormalFilter(filter: FilterGroup): boolean {
    if (filter.type !== normalWrapFilter.type) {
        return false;
    }
    // Check if all the expressions of the normalModeWrapFilter are in the filterGroup
    if (
        normalWrapFilter.expressions.some(
            (normalExpression, i) =>
                !isEqual(filter.expressions[i], normalExpression)
        )
    ) {
        return false;
    }
    const lastExpression = filter.expressions[filter.expressions.length - 1]!;
    const lengthDifference =
        filter.expressions.length - normalWrapFilter.expressions.length;
    return lengthDifference === 1 && isFilterGroup(lastExpression);
}
