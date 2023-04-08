import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'typeof',
})
export class TypeofPipe implements PipeTransform {
    transform(value: unknown) {
        return typeof value;
    }
}
