import type { OnDestroy, PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
    name: 'numberFormat',
})
/**
 * This pipe transforms numbers to the correct local (and optional unit) standard for better readability
 * e.g.:
 *     english: 1,000.3
 *     german: 1.000,3
 */
export class NumberFormatPipe
    extends Destroyed
    implements PipeTransform, OnDestroy
{
    constructor(private readonly i18nService: I18nService) {
        super();
    }

    transform(
        value: number,
        format: NumberFormat = 'number'
    ): Observable<string> {
        const formattedNumber$ = new ReplaySubject<string>(1);
        // Reemit the date if the language changes
        this.i18nService.languageChangesBCP47$
            .pipe(takeUntil(this.destroyed))
            .subscribe((newLanguage) => {
                const numberWithThousandSeparator = value
                    .toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/gu, ' ');
                const localizedNumber =
                    newLanguage === 'de'
                        ? numberWithThousandSeparator.replace('.', ',')
                        : numberWithThousandSeparator;
                formattedNumber$.next(localizedNumber);
            });
        return formattedNumber$.pipe(takeUntil(this.destroyed));
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}

type NumberFormat = 'number';
