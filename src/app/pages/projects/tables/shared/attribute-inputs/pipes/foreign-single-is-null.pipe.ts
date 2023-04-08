import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ForeignInputValues } from '../foreign/foreign-input-value';
import { ForeignInputValuesProcessor } from '../foreign/foreign-input-values-processor';

@Pipe({
    name: 'foreignSingleIsNull',
})
export class ForeignSingleIsNullPipe implements PipeTransform {
    /**
     * @returns wether the single foreign value is empty/null
     */
    transform(value: ForeignInputValues, numberOfPresentRelations: number) {
        return (
            ForeignInputValuesProcessor.getNumberOfRelationsAfterSave(
                value,
                numberOfPresentRelations
            ) === 0
        );
    }
}
