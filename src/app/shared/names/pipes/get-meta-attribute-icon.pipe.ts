import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import type { IconType } from '@main-shared/icon/icon-type';
import { getMetaAttributeIcon } from '../utility/get-meta-attribute-icon';

@Pipe({
    name: 'getMetaAttributeIcon',
})
export class GetMetaAttributeIconPipe implements PipeTransform {
    transform(attr: MetaAttribute): IconType | undefined {
        return getMetaAttributeIcon(attr);
    }
}
