import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { PessimisticDisplayNameItem } from '@cache-server/api/tables/display-name';

@Pipe({
    name: 'getPluralName',
})
export class GetPluralNamePipe implements PipeTransform {
    transform(
        value: PessimisticDisplayNameItem | null | undefined
    ): string | null {
        if (value) {
            return value.plural ? value.plural : value.singular;
        }
        return null;
    }
}
