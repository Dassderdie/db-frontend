import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'removeLinebreaks',
})
export class RemoveLinebreaksPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (typeof value === 'string') {
            return value.replace(/<br.*?>|\r?\n|\r/gu, ' ');
        }
        return '';
    }
}
