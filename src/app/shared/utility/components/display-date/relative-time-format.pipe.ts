import type { OnDestroy, PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable, Subject } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
    name: 'relativeTimeFormat',
})
export class RelativeTimeFormatPipe
    extends Destroyed
    implements PipeTransform, OnDestroy
{
    constructor(private readonly i18nService: I18nService) {
        super();
    }

    /**
     * A pure pipe doesn't have to create a new instance for every spot it is called - there is one pipe per component -> make sure timers
     * for different times don't overwrite each other
     */
    private readonly timeouts: { [time: string]: NodeJS.Timeout } = {};
    private readonly formatters: {
        [lang: string]: {
            [format: string]: Intl.RelativeTimeFormat;
        };
    } = {};

    /**
     * All times are in ms
     */
    private static getTimeUnit(relativeTime: number): {
        /**
         * the value should be updated every ${step} ms
         */
        step: number;
        /**
         * the name of the unit to use
         */
        name: Intl.RelativeTimeFormatUnit;
        /**
         * the value of the provided relative Time in this unit
         * ${value} ${name} == ${relativeTime} ms
         * e.g.: name = minutes, relativeTime = 1000 * 60 * 4 ms -> value = 4
         */
        value: number;
    } {
        const absTime = Math.abs(relativeTime);
        let step = 1000;
        let unitEndTime = 60000;
        if (absTime < unitEndTime) {
            return {
                step,
                name: 'seconds',
                value: Math.trunc(relativeTime / step),
            };
        }
        step = unitEndTime;
        unitEndTime *= 60;
        if (absTime < unitEndTime) {
            return {
                step,
                name: 'minutes',
                value: Math.trunc(relativeTime / step),
            };
        }
        step = unitEndTime;
        unitEndTime *= 24;
        if (absTime < unitEndTime) {
            return {
                step,
                name: 'hours',
                value: Math.trunc(relativeTime / step),
            };
        }
        step = unitEndTime;
        unitEndTime *= 30;
        if (absTime < unitEndTime) {
            return {
                step,
                name: 'days',
                value: Math.trunc(relativeTime / step),
            };
        }
        step = unitEndTime;
        unitEndTime = (unitEndTime / 30) * 365;
        if (absTime < unitEndTime) {
            return {
                step,
                name: 'months',
                value: Math.trunc(relativeTime / step),
            };
        }
        step = unitEndTime;
        return { step, name: 'years', value: Math.trunc(relativeTime / step) };
    }

    /**
     * @returns a stream of the correctly formatted (and localized) date
     */
    transform(date: string, format: RelativeTimeFormat): Observable<string> {
        const relativeDateTimeE$ = new ReplaySubject<string>(1);
        this.emitDate(relativeDateTimeE$, date, format);
        // Reemit the date if the language changes
        this.i18nService.languageChangesBCP47$
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.emitDate(relativeDateTimeE$, date, format));
        return relativeDateTimeE$.pipe(takeUntil(this.destroyed));
    }

    private emitDate(
        relativeDateTimeE$: Subject<string>,
        date: string,
        format: RelativeTimeFormat
    ): void {
        try {
            const dateInMs = new Date(date).valueOf();
            const formatter = this.getFormatter(
                this.i18nService.currentLanguageIso639_2,
                format
            );
            const now = Date.now();
            const unit = RelativeTimeFormatPipe.getTimeUnit(dateInMs - now);
            relativeDateTimeE$.next(formatter.format(unit.value, unit.name));
            // in how many ms the date should be updated next (make a timeline to check the formulas)
            let nextUpdate: number;
            if (dateInMs <= now) {
                nextUpdate =
                    (Math.floor((now - dateInMs) / unit.step) + 1) * unit.step +
                    dateInMs -
                    now;
            } else {
                nextUpdate =
                    (Math.floor((dateInMs - now) / unit.step) + 1) * unit.step +
                    now -
                    dateInMs;
            }
            // it is not recommended to let the website running nonstop for 10+ days -> performance/memory improvement
            if (nextUpdate < 1000 * 60 * 60 * 24 * 10) {
                // update the value in step ms
                const timeout = this.timeouts[date];
                if (timeout) {
                    clearTimeout(timeout);
                }
                this.timeouts[date] = setTimeout(
                    () => this.emitDate(relativeDateTimeE$, date, format),
                    nextUpdate
                );
            }
        } catch {
            // fallback for browsers that don't support Intl.RelativeTimeFormat yet
            relativeDateTimeE$.next(date);
        }
    }

    private getFormatter(lang: string, format: RelativeTimeFormat) {
        if (!this.formatters[lang]) {
            this.formatters[lang] = {};
        }
        const formatter = this.formatters[lang]!;
        if (!formatter[format]) {
            formatter[format] = new Intl.RelativeTimeFormat(
                this.i18nService.currentLanguageBCP47,
                {
                    style: format,
                    numeric: 'auto',
                }
            );
        }
        return formatter[format]!;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        for (const timeout of Object.values(this.timeouts)) {
            clearTimeout(timeout);
        }
    }
}

export type RelativeTimeFormat = 'long' | 'short';
