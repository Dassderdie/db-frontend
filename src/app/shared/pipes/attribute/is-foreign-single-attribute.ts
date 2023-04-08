import type {
    Attribute,
    ForeignAttribute,
} from '@cache-server/api/tables/attribute';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type {
    EditableAttribute,
    EditableForeignAttribute,
} from '@tables-editor/shared/edit-attribute/editable-attribute';

// export function isForeignSingleAttribute(
//     attribute: DeepReadonly<EditableAttribute>
// ): attribute is DeepReadonly<EditableForeignAttribute>;
// export function isForeignSingleAttribute(
//     attribute: Attribute
// ): attribute is ForeignAttribute;
export function isForeignSingleAttribute(
    attribute: Attribute | DeepReadonly<EditableAttribute>
): attribute is DeepReadonly<EditableForeignAttribute> | ForeignAttribute {
    return (
        attribute.kind === 'foreign' &&
        !attribute.kindOptions.intermediateAttributes.length &&
        attribute.kindOptions.relationshipMax === 1
    );
}
