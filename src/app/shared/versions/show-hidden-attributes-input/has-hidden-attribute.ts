import type { Attribute } from '@cache-server/api/tables/attribute';

export function hasHiddenAttribute(
    attributes: ReadonlyArray<Attribute>
): boolean {
    for (const attribute of attributes) {
        if (
            attribute.hidden ||
            (attribute.kind === 'foreign' &&
                hasHiddenAttribute(
                    attribute.kindOptions.intermediateAttributes
                ))
        ) {
            return true;
        }
    }
    return false;
}
