import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import type { Observable } from 'rxjs';
import { combineLatest, isObservable, ReplaySubject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { InputControl } from '../input-control';
import type { Option } from './option';

export class SelectInput<T> extends InputControl<T> {
    public readonly type = 'select';
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;
    public readonly options$: Observable<ReadonlyArray<Option<T>>> =
        new ReplaySubject(1);

    /**
     * the index of the selected option in the current options array
     */
    public readonly selectedOption$: Observable<
        | {
              option: Option<T>;
              index: number;
          }
        | undefined
    > = combineLatest([this.value$, this.options$]).pipe(
        map(([value, options]) => {
            const index = options.findIndex((option) => option.value === value);
            if (index >= 0) {
                return {
                    index,
                    option: options[index]!,
                };
            }
            errors.error({
                message: 'unknown Option',
                logValues: { value, options },
            });
            return undefined;
        }),
        takeUntil(this.destroyed),
        shareReplay({ bufferSize: 1, refCount: false })
    );
    /**
     * Wether there are no other options to choose from besides the current one
     */
    public readonly noOptionsToChoose$ = this.options$.pipe(
        map(
            (options) => options.filter((option) => !option.disabled).length < 2
        ),
        takeUntil(this.destroyed),
        shareReplay({ bufferSize: 1, refCount: false })
    );

    constructor(
        name: string,
        initialValue: T,
        options:
            | Observable<ReadonlyArray<Option<T>>>
            | ReadonlyArray<Option<T>>,
        settings: {
            validators?: Validators<T>;
            asyncValidators?: AsyncValidators<T>;
            warningValidators?: Validators<T>;
            warningAsyncValidators?: AsyncValidators<T>;
            firstCurrentValue?: T;
            disabled?: boolean;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                adjustable: settings.validators,
                adjustableWarnings: settings.warningValidators,
            },
            {
                adjustable: settings.asyncValidators,
                adjustableWarnings: settings.warningAsyncValidators,
            },
            settings.firstCurrentValue
        );
        this.setDisabled(settings.disabled ?? this.disabled);
        this.description = settings.description ?? this.description;
        const optionsE$ = this.options$ as ReplaySubject<
            ReadonlyArray<Option<T>>
        >;
        if (isObservable(options)) {
            options.pipe(takeUntil(this.destroyed)).subscribe(optionsE$);
        } else {
            optionsE$.next(options);
        }
    }

    destroy() {
        super.destroy();
        (this.options$ as ReplaySubject<any>).complete();
    }
}
