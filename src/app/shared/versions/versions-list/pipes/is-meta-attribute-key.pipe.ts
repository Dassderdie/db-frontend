import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';

@Pipe({
    name: 'isMetaAttributeKey',
})
export class IsMetaAttributeKeyPipe implements PipeTransform {
    /**
     * @param metaAttrKey of the meta-attribute
     * @returns the key if it is a metaAttribute else null
     */
    transform(metaAttrKey: MetaAttribute | UUID) {
        if (metaAttributes.includes(metaAttrKey as MetaAttribute)) {
            return metaAttrKey as MetaAttribute;
        }
        return null;
    }
}
