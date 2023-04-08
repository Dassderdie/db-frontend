import type { OnDestroy, PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { StateErrors } from '@shared/utility/classes/state/state-error';
import { cloneDeep } from 'lodash-es';
import type { Observable } from 'rxjs';
import { merge, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Pipe({
    name: 'processStateErrors',
})
export class ProcessStateErrorsPipe
    extends Destroyed
    implements PipeTransform, OnDestroy
{
    constructor(private readonly translateService: TranslateService) {
        super();
    }

    /**
     * for errors and warnings
     *
     * mainly translates the translationKeyOptions
     */
    transform<T>(errors: StateErrors<T>): Observable<StateErrors<T>> {
        const errors$ = new ReplaySubject<StateErrors<T>>(1);
        const translateActions: Observable<{
            errorName: string;
            key: string;
            translation: string;
        }>[] = [];
        for (const [errorName, error] of Object.entries(errors)) {
            if (!error.translationKeyOptions) {
                continue;
            }
            for (const [key, translationKeyOption] of Object.entries(
                error.translationKeyOptions
            )) {
                translateActions.push(
                    this.translateService.get(translationKeyOption as any).pipe(
                        map((translation) => ({
                            errorName,
                            key,
                            translation,
                        })),
                        takeUntil(this.destroyed)
                    )
                );
            }
        }
        if (translateActions.length === 0) {
            errors$.next(errors);
        } else {
            const clonedErrors = cloneDeep(errors);
            merge(...translateActions)
                .pipe(
                    map((v) => {
                        clonedErrors[v.errorName]![v.key] = v.translation;
                        return clonedErrors;
                    })
                )
                .subscribe(errors$);
        }
        return errors$.asObservable();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
