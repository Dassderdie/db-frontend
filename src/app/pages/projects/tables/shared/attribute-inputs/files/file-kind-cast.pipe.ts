import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'fileKindCast',
})
/**
 * TODO: this is only a workaround to be able to cast a specific value correctly in the templates
 */
export class FileKindCastPipe implements PipeTransform {
    transform(value: string): 'files' | 'newFiles' {
        return value as 'files' | 'newFiles';
    }
}
