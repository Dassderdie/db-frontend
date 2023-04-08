import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';

@Pipe({
    name: 'attributeById',
})
export class AttributeByIdPipe implements PipeTransform {
    transform<A extends Attribute | DeepReadonly<EditableAttribute>>(
        id: string,
        attributes: ReadonlyArray<A>
    ): A | null {
        return attributes.find((attr) => attr.id === id) ?? null;
    }
}
