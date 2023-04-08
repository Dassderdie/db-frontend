import type { Attribute } from '@cache-server/api/tables/attribute';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { EditableAttribute } from './edit-attribute/editable-attribute';

/**
 * @returns wether at least one attribute (or intermediate attribute) is been missing in newAttributes, that was there on oldAttributes
 */
export function hasAnAttributeBeenRemoved(
    newAttributes: ReadonlyArray<Attribute | DeepReadonly<EditableAttribute>>,
    oldAttributes: ReadonlyArray<Attribute | DeepReadonly<EditableAttribute>>
): boolean {
    for (const oldAttr of oldAttributes) {
        const newAttr = newAttributes.find((attr) => attr.id === oldAttr.id);
        if (!newAttr) {
            return true;
        }
        if (
            newAttr.kind === 'foreign' &&
            oldAttr.kind === 'foreign' &&
            hasAnAttributeBeenRemoved(
                newAttr.kindOptions.intermediateAttributes,
                oldAttr.kindOptions.intermediateAttributes
            )
        ) {
            return true;
        }
    }
    return false;
}
