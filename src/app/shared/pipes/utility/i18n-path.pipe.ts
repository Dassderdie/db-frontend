import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'i18nPath',
})
export class I18nPathPipe implements PipeTransform {
    constructor(private readonly i18nService: I18nService) {}

    /**
     * @param path the path to the file like '/assets/images/history-preview'
     * @param extension the extension of the file like 'png'
     */
    transform(path: string, extension: string): Observable<string> {
        return this.i18nService.languageChangesIso639_2$.pipe(
            map((lang) => `${path}.${lang}.${extension}`)
        );
    }
}
