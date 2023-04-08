import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FilesValue, Version } from '@cache-server/api/versions/version';
import type { FilesInputValues } from 'src/app/pages/projects/tables/shared/attribute-inputs/files/files-input-values';
import type { ForeignInputValues } from '../attribute-inputs/foreign/foreign-input-value';

@Pipe({
    name: 'getCurrentValue',
})
export class GetCurrentValuePipe implements PipeTransform {
    transform<T extends Version['values'][0]>(
        initialValue: T,
        changedValue?:
            | Exclude<T, FilesValue>
            | FilesInputValues
            | ForeignInputValues
    ) {
        return changedValue === undefined ? initialValue : changedValue;
    }
}
