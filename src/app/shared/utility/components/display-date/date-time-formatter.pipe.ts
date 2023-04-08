import type { OnDestroy, PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable, Subject } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
    name: 'dateTimeFormatter',
})
export class DateTimeFormatterPipe
    extends Destroyed
    implements PipeTransform, OnDestroy
{
    constructor(private readonly i18nService: I18nService) {
        super();
    }

    private readonly formatters: {
        [lang: string]: {
            [format: string]: Intl.DateTimeFormat;
        };
    } = {};

    /**
     * @returns a stream of the correctly formatted (and localized) date
     */
    transform(date: string, format: DateTimeFormat): Observable<string> {
        const formattedDateTimeE$ = new ReplaySubject<string>(1);
        // Reemit the date if the language changes
        this.i18nService.languageChangesBCP47$
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.emitDate(formattedDateTimeE$, date, format));
        return formattedDateTimeE$.pipe(takeUntil(this.destroyed));
    }

    private emitDate(
        formattedDateTimeE$: Subject<string>,
        date: string,
        format: DateTimeFormat
    ): void {
        try {
            const formatter = this.getFormatter(
                this.i18nService.currentLanguageIso639_2,
                format
            );
            formattedDateTimeE$.next(formatter.format(new Date(date)));
        } catch {
            formattedDateTimeE$.next(date);
        }
    }

    private getFormatter(
        lang: string,
        format: DateTimeFormat
    ): Intl.DateTimeFormat {
        if (!this.formatters[lang]) {
            this.formatters[lang] = {};
        }
        const formatter = this.formatters[lang]!;
        if (!formatter[format]) {
            let options: Intl.DateTimeFormatOptions = {};
            switch (format) {
                case 'dateTime':
                    options = {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        weekday: 'short',
                    };
                    break;
                case 'shortDateTime':
                    options = {
                        year: '2-digit',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    };
                    break;
                case 'longDate':
                    options = {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                    };
                    break;
                case 'shortDate':
                    options = {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                    };
                    break;
                case 'time':
                    options = {
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                    };
                    break;
            }
            formatter[format] = new Intl.DateTimeFormat(
                this.i18nService.currentLanguageBCP47,
                options
            );
        }
        return formatter[format]!;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}

export type DateTimeFormat =
    | 'dateTime'
    | 'longDate'
    | 'shortDate'
    | 'shortDateTime'
    | 'time';
