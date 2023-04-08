import type { AttributeFilter } from '@cache-server/api/versions/attribute-filter';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import type { EditableFilterGroup } from './editable-filter-group';
import { isEditableFilterGroup } from './editable-filter-group';

/**
 * removes all empty filterGroups from the provided filterGroup and converts the editableFilterGroup to one that is accept by the backend
 * @returns the so cleaned filterGroup
 */
export function convertEditableFilterToCleanedFilter(
    editableFilter: EditableFilterGroup | null
): DeepWritable<FilterGroup> | null {
    if (!editableFilter) {
        return null;
    }
    const expressions: DeepWritable<FilterGroup['expressions']> =
        editableFilter.expressions.flatMap(
            (
                expression
            ): DeepWritable<Array<AttributeFilter | FilterGroup>> => {
                if (isEditableFilterGroup(expression)) {
                    const cleanedFilterGroup =
                        convertEditableFilterToCleanedFilter(expression);
                    return cleanedFilterGroup ? [cleanedFilterGroup] : [];
                } else if (expression.invalid) {
                    return [];
                }
                return [
                    {
                        type: expression.type,
                        key: expression.key,
                        value: cloneDeepWritable(expression.value),
                    },
                ];
            }
        );
    return expressions.length > 0
        ? {
              type: getFilterType(editableFilter),
              expressions,
          }
        : null;
}

function getFilterType(
    editableFilter: EditableFilterGroup
): FilterGroup['type'] {
    if (editableFilter.expressions.length === 1) {
        // in this case and has the same effect as or -> higher consistency
        return editableFilter.negated ? 'nand' : 'and';
    }
    if (editableFilter.negated) {
        if (editableFilter.conjunction === 'and') {
            return 'nand';
        }
        return 'nor';
    }
    return editableFilter.conjunction;
}
