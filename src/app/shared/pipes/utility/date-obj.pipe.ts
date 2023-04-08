import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'dateObj',
})
export class DateObjPipe implements PipeTransform {
    transform(value: string | null | undefined) {
        if (value) {
            return new Date(value);
        }
        return undefined;
    }
}
