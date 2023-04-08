import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { StateErrors } from '@shared/utility/classes/state/state-error';
import { pickBy } from 'lodash-es';

@Pipe({
    name: 'filterHiddenErrors',
})
export class FilterHiddenErrorsPipe implements PipeTransform {
    transform<T>(errors: StateErrors<T>): StateErrors<T> {
        return pickBy(errors, (error) => !error.hidden);
    }
}
