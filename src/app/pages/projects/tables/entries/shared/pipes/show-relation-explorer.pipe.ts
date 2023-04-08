import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';

@Pipe({
    name: 'showRelationExplorer',
})
export class ShowRelationExplorerPipe implements PipeTransform {
    transform(attributes: ReadonlyArray<Attribute> | undefined) {
        if (!attributes) {
            return false;
        }
        return attributes.some((attribute) => attribute.kind === 'foreign');
    }
}
