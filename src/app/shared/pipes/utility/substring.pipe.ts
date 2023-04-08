import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'substring',
})
export class SubstringPipe implements PipeTransform {
    transform(value: string | null | undefined, start: number, end: number) {
        if (value) {
            return value.slice(start, end);
        }
        return '';
    }
}
