import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';

@Pipe({
    name: 'translateMetaAttribute',
})
export class TranslateMetaAttributePipe implements PipeTransform {
    /**
     * @param metaAttrName of the meta-attribute
     * @returns translate key or null if not a meta-attribute-name
     */
    transform(metaAttrName: MetaAttribute | UUID) {
        switch (metaAttrName as MetaAttribute) {
            case 'entryCreatedAt':
                return _('meta-attributes.entryCreatedAt');
            case 'createdAt':
                return _('meta-attributes.createdAt');
            case 'deleted':
                return _('meta-attributes.deleted');
            case 'creatorId':
                return _('meta-attributes.creatorId');
            case 'invalidatorId':
                return _('meta-attributes.invalidatorId');
            case 'invalidatedAt':
                return _('meta-attributes.invalidatedAt');
            default:
                return null;
        }
    }
}
