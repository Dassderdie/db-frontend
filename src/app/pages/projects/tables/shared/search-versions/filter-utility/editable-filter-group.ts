import type { UUID } from '@cache-server/api/uuid';
import { v4 as uuid } from 'uuid';
import type { AttributeFilter } from '@cache-server/api/versions/attribute-filter';
import type { DeepWritable } from '@shared/utility/types/writable';

export interface EditableFilterGroup {
    /**
     * An unique id that identifies the FilterGroup (for trackBy)
     */
    // `key` instead of `id` to be consistent with the trackBy identifier for attributeFilter
    readonly key: UUID;
    readonly negated: boolean;
    readonly conjunction: 'and' | 'or';
    readonly expressions: ReadonlyArray<
        EditableAttributeFilter | EditableFilterGroup
    >;
}

export interface EditableAttributeFilter extends AttributeFilter {
    /**
     * Wether the attribute specified by the key is not deleted
     */
    readonly invalid: boolean;
}

export function isEditableFilterGroup(
    expression: EditableFilterGroup['expressions'][0]
): expression is EditableFilterGroup {
    return (expression as any).expressions;
}

export function isEditableFilterGroupEmpty(
    expression: EditableFilterGroup
): boolean {
    return expression.expressions.length === 0;
}

export function generateEmptyEditableFilterGroup(): DeepWritable<EditableFilterGroup> {
    return { key: uuid(), negated: false, conjunction: 'and', expressions: [] };
}
