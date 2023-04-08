import type { AttributeFilter } from '@cache-server/api/versions/attribute-filter';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { isFilterGroup } from '@cache-server/api/versions/filter-group';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';
import { isEqual } from 'lodash-es';
import { normalWrapFilter } from './normal-wrap-filter';

/**
 * @param filter
 * @returns wether the filter is an advancedFilter
 * this means it is not wrapped by the normalWrapFilter or has on other places than the normalWrapFilter advancedExpressions
 */
export function appliedFilterIsAdvancedFilter(filter: FilterGroup): boolean {
    if (
        filter.type !== normalWrapFilter.type ||
        filter.expressions.length < normalWrapFilter.expressions.length
    ) {
        return true;
    }
    return filter.expressions.some((expression, i) =>
        normalWrapFilter.expressions[i]
            ? !isEqual(normalWrapFilter.expressions[i], expression)
            : isAdvancedExpression(expression)
    );
}

function isAdvancedExpression(expression: AttributeFilter | FilterGroup) {
    return isFilterGroup(expression)
        ? isAdvancedFilterGroup(expression)
        : isAdvancedAttributeFilter(expression);
}

/**
 * @param filterGroup
 * @returns wether the filterGroup has advanced expressions in it
 */
function isAdvancedFilterGroup(filterGroup: FilterGroup): boolean {
    return filterGroup.expressions.some((expression) =>
        isAdvancedExpression(expression)
    );
}

/**
 * @param attributeFilter
 * @returns wether the attributeFilter is an advanced expression
 */
function isAdvancedAttributeFilter(attributeFilter: AttributeFilter) {
    return metaAttributes.includes(attributeFilter.key as MetaAttribute);
}
