import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { JsonObject } from '@shared/utility/types/json-object';

@Pipe({
    name: 'objectKeys',
})
export class ObjectKeysPipe implements PipeTransform {
    transform(object: JsonObject | null | undefined) {
        if (object) {
            return Object.keys(object);
        }
        return [];
    }
}
