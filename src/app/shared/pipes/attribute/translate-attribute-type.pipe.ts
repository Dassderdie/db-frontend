import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Attribute } from '@cache-server/api/tables/attribute';

@Pipe({
    name: 'translateAttributeType',
})
export class TranslateAttributeTypePipe implements PipeTransform {
    /**
     * @param attributeKind the attribute kind for which a translation key should be returned
     * @param name wether the key for the name or the description of the attribute should be returned
     * @returns the translation-key for the attribute kind
     */
    transform(
        attributeKind: Attribute['kind'] | 'foreignMultiple' | 'foreignSingle',
        name: boolean
    ): string {
        switch (attributeKind) {
            case 'boolean':
                return name
                    ? _('attribute-kinds.boolean.name')
                    : _('attribute-kinds.boolean.description');
            case 'date':
                return name
                    ? _('attribute-kinds.date.name')
                    : _('attribute-kinds.date.description');
            case 'date-time':
                return name
                    ? _('attribute-kinds.date-time.name')
                    : _('attribute-kinds.date-time.description');
            case 'email':
                return name
                    ? _('attribute-kinds.email.name')
                    : _('attribute-kinds.email.description');
            case 'files':
                return name
                    ? _('attribute-kinds.files.name')
                    : _('attribute-kinds.files.description');
            case 'foreign':
            case 'foreignMultiple':
                return name
                    ? _('attribute-kinds.foreign.name')
                    : _('attribute-kinds.foreign.description');
            case 'foreignSingle':
                return name
                    ? _('attribute-kinds.foreign-single.name')
                    : _('attribute-kinds.foreign-single.description');
            case 'number':
                return name
                    ? _('attribute-kinds.number.name')
                    : _('attribute-kinds.number.description');
            case 'string':
                return name
                    ? _('attribute-kinds.string.name')
                    : _('attribute-kinds.string.description');
            case 'url':
                return name
                    ? _('attribute-kinds.url.name')
                    : _('attribute-kinds.url.description');
            case 'time':
                return name
                    ? _('attribute-kinds.time.name')
                    : _('attribute-kinds.time.description');
            default:
                errors.error({
                    message: `Unknown attribute type: ${attributeKind}`,
                });
        }
        return '';
    }
}
