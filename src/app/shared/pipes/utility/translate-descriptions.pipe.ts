import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import type { Languages } from '@core/utility/i18n/languages';

@Pipe({
    name: 'translateDescriptions',
})
export class TranslateDescriptionsPipe implements PipeTransform {
    constructor(public i18nService: I18nService) {}

    transform(
        displayText: Languages<string | null | undefined> | null | undefined
    ) {
        if (displayText) {
            return this.i18nService.getLanguage(displayText);
        }
        return null;
    }
}
