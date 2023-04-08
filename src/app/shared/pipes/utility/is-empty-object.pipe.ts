import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { JsonObject } from '@shared/utility/types/json-object';
import { isEmpty } from 'lodash-es';

@Pipe({
    name: 'isEmptyObject',
})
export class IsEmptyObjectPipe implements PipeTransform {
    transform(value: JsonObject): any {
        return isEmpty(value);
    }
}
