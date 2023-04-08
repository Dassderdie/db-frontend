import type { OnDestroy, PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
    name: 'prettySizePipe',
})
/**
 * Formats the given size (in Byte) to a nicer format by using the appropriate unit
 */
export class PrettySizePipe
    extends Destroyed
    implements PipeTransform, OnDestroy
{
    constructor(private readonly i18nService: I18nService) {
        super();
    }

    private readonly formatters: {
        [lang: string]: {
            [unit: string]: Intl.NumberFormat;
        };
    } = {};

    private readonly sizeUnits: SizeUnit[] = [
        'byte',
        'kilobyte',
        'megabyte',
        'gigabyte',
        'terabyte',
        'petabyte',
    ];

    /**
     * @param size in byte
     */
    transform(size: number): Observable<string> {
        let unitSize = 1;
        for (const unit of this.sizeUnits) {
            if (unitSize * 1024 > size) {
                return this.createPrettyFileSize(size, unit, unitSize);
            }
            unitSize *= 1024;
        }
        return this.createPrettyFileSize(
            size,
            this.sizeUnits[this.sizeUnits.length - 1]!,
            unitSize
        );
    }

    private getFormatter(lang: string, unit: SizeUnit): Intl.NumberFormat {
        if (!this.formatters[lang]) {
            this.formatters[lang] = {};
        }
        const formatter = this.formatters[lang]!;
        if (!formatter[unit]) {
            formatter[unit] = new Intl.NumberFormat(
                this.i18nService.currentLanguageBCP47,
                {
                    style: 'unit',
                    unit,
                    unitDisplay: 'short',
                    maximumFractionDigits: 2,
                } as Intl.NumberFormatOptions
            );
        }
        return formatter[unit]!;
    }

    private createPrettyFileSize(
        size: number,
        unit: SizeUnit,
        unitSize: number
    ): Observable<string> {
        const prettyFileSize$ = new ReplaySubject<string>(1);
        // Reemit the date if the language changes
        this.i18nService.languageChangesBCP47$
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                try {
                    const formatter = this.getFormatter(
                        this.i18nService.currentLanguageIso639_2,
                        unit
                    );
                    prettyFileSize$.next(formatter.format(size / unitSize));
                } catch {
                    prettyFileSize$.next(size.toString());
                }
            });
        return prettyFileSize$.pipe(takeUntil(this.destroyed));
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}

type SizeUnit =
    | 'byte'
    | 'gigabyte'
    | 'kilobyte'
    | 'megabyte'
    | 'petabyte'
    | 'terabyte';
