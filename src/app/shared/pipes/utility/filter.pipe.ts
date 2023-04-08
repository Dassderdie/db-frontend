import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'filter',
})
export class FilterPipe implements PipeTransform {
    /**
     * @param properties of an item e.g. T[property1][property2]
     * @param invert wether the item should be excluded when the property is true (invert=false)
     * @returns the filtered array
     */
    transform<T>(
        array: ReadonlyArray<T>,
        properties: [keyof T, ...string[]],
        invert?: boolean
    ): ReadonlyArray<T> {
        return array.filter((item) =>
            invert ? !filterFct(item, properties) : filterFct(item, properties)
        );
    }
}

function filterFct<T>(item: T, keys: [keyof T, ...string[]]) {
    let temp = item;
    for (const key of keys) {
        temp = (item as any)[key];
        if (!temp) {
            return false;
        }
    }
    return true;
}
