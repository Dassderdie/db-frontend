import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';
import { isForeignSingleAttribute } from './is-foreign-single-attribute';

@Pipe({
    name: 'isForeignSingleAttribute',
})
export class IsForeignSingleAttributePipe implements PipeTransform {
    transform(attribute: Attribute | DeepReadonly<EditableAttribute>): boolean {
        return isForeignSingleAttribute(attribute);
    }
}
