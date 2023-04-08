import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { isFilterGroup } from '@cache-server/api/versions/filter-group';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { v4 as uuid } from 'uuid';
import type { EditableFilterGroup } from './editable-filter-group';

export function convertFilterToEditableFilter(
    filterGroup: FilterGroup,
    attributes: ReadonlyArray<Attribute>
): DeepWritable<EditableFilterGroup> {
    return convertWritableFilterToEditableFilter(
        cloneDeepWritable(filterGroup),
        [...attributes.map((attr) => attr.id), ...metaAttributes]
    );
}

export function convertWritableFilterToEditableFilter(
    filterGroup: DeepWritable<FilterGroup>,
    attributeKeys: ReadonlyArray<MetaAttribute | UUID>
): DeepWritable<EditableFilterGroup> {
    return {
        key: uuid(),
        negated: filterGroup.type === 'nand' || filterGroup.type === 'nor',
        conjunction:
            filterGroup.type === 'nand' || filterGroup.type === 'and'
                ? 'and'
                : 'or',
        expressions: filterGroup.expressions.map((expression) => {
            if (isFilterGroup(expression)) {
                return convertWritableFilterToEditableFilter(
                    expression,
                    attributeKeys
                ) as any;
            }
            return {
                ...expression,
                invalid: !attributeKeys.includes(expression.key),
            };
        }),
    };
}
