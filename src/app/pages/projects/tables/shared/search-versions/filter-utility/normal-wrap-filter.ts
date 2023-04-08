import type { FilterGroup } from '@cache-server/api/versions/filter-group';

/**
 * if the `filter` is not created in advanced-mode the filter that should actually be applied is:
 * ```ts
 * appliedFilter = {
 *      type: 'and',
 *      expressions: [
 *          ...normalModeWrapFilter.expressions,
 *          ...filter
 *      ]
 * }
 * ```
 */
export const normalWrapFilter: FilterGroup = {
    type: 'and',
    expressions: [
        { key: 'deleted', value: false, type: 'equal' },
        {
            key: 'invalidatedAt',
            type: 'equal',
            value: null,
        },
    ],
};

/**
 * The filter that should be applied if no filter is specified in the query
 */
export const defaultFilter = normalWrapFilter;
