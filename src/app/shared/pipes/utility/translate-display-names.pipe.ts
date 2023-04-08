import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type {
    DisplayNameItem,
    PessimisticDisplayNames,
} from '@cache-server/api/tables/display-name';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { clone } from 'lodash-es';

@Pipe({
    name: 'translateDisplayNames',
})
export class TranslateDisplayNamesPipe implements PipeTransform {
    constructor(public i18nService: I18nService) {}

    transform(
        displayName: PessimisticDisplayNames | null | undefined
    ): DisplayNameItem<string | null> | null {
        if (displayName) {
            // clone to trigger changeDetection in pipes
            return clone(this.i18nService.getLanguage(displayName));
        }
        return null;
    }
}
