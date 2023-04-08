import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { StateError, StateErrors } from './state-error';
import { ValidatorExecuter } from './validator-executer';

export abstract class ValidatorState<T> {
    /**
     * emits when the state should get destroyed
     */
    protected readonly destroyed = new Subject();
    /**
     * the value that should get validated
     */
    protected abstract value: T;

    private readonly errorExecuter: ValidatorExecuter<T>;
    private readonly warningExecuter: ValidatorExecuter<T>;

    /**
     * Wether there are asyncValidators pending
     */
    public readonly invalidPending$: Observable<boolean>;
    public getInvalidPending() {
        return this.errorExecuter.pending;
    }

    /**
     * Wether there are asyncValidators for warnings pending
     */
    public readonly hasWarningPending$: Observable<boolean>;
    public getWarningPending() {
        return this.warningExecuter.pending;
    }

    /**
     * all current errors from the sync and async validators
     */
    public readonly errors$: Observable<StateErrors<T>>;
    public getErrors() {
        return this.errorExecuter.errors;
    }
    /**
     * all current warnings from the sync and async validators
     */
    public readonly warnings$: Observable<StateErrors<T>>;
    public getWarnings() {
        return this.warningExecuter.errors;
    }

    /**
     * Wether the value is not a valid one
     */
    public get invalid() {
        return this.errorExecuter.hasError;
    }
    public readonly invalid$: Observable<boolean>;

    /**
     * Wether the value is not a valid one
     */
    public get hasWarning() {
        return this.warningExecuter.hasError;
    }
    public readonly hasWarning$: Observable<boolean>;

    constructor(
        /**
         * the synchronous validators which determine wether the input is invalid or valid
         * persistent: these validators will not be affected by setValidators
         * adjustable: these validators will be removed and set again by setValidators
         * !two validators (async and sync combined) mustn't produce the same error!
         */
        validators: {
            persistent?: Validators<T>;
            adjustable?: Validators<T>;
            persistentWarnings?: Validators<T>;
            adjustableWarnings?: Validators<T>;
        } = {},
        /**
         * the asynchronous validators which determine wether the input is invalid or valid
         * persistent: these validators will not be affected by setAsyncValidators
         * adjustable: these validators will be removed and set again by setAsyncValidators
         * !two validators (async and sync combined) mustn't produce the same error!
         */
        asyncValidators: {
            persistent?: AsyncValidators<T>;
            adjustable?: AsyncValidators<T>;
            persistentWarnings?: AsyncValidators<T>;
            adjustableWarnings?: AsyncValidators<T>;
        } = {}
    ) {
        this.errorExecuter = new ValidatorExecuter(
            this.destroyed,
            () => this.value,
            {
                adjustable: validators.adjustable,
                persistent: validators.persistent,
            },
            {
                adjustable: asyncValidators.adjustable,
                persistent: asyncValidators.persistent,
            }
        );
        this.errors$ = this.errorExecuter.errors$;
        this.invalid$ = this.errorExecuter.invalid$;
        this.invalidPending$ = this.errorExecuter.pending$;
        this.warningExecuter = new ValidatorExecuter(
            this.destroyed,
            () => this.value,
            {
                adjustable: validators.adjustableWarnings,
                persistent: validators.persistentWarnings,
            },
            {
                adjustable: asyncValidators.adjustableWarnings,
                persistent: asyncValidators.persistentWarnings,
            }
        );
        this.warnings$ = this.warningExecuter.errors$;
        this.hasWarning$ = this.warningExecuter.invalid$;
        this.hasWarningPending$ = this.warningExecuter.pending$;

        // because checkValidity() is synchronous -> therefore access via the validators `this` before the `super()`-call is completed
        setTimeout(() => this.checkValidity(), 0);
    }

    /**
     * applies all validators to the current value
     */
    public checkValidity() {
        this.errorExecuter.checkValidity();
        this.warningExecuter.checkValidity();
    }

    /**
     * updates the adjustable synchronous validators of the input
     */
    public setValidators(
        newValidators?: Validators<T>,
        newWarningValidators?: Validators<T>
    ) {
        this.errorExecuter.setValidators(newValidators);
        this.warningExecuter.setValidators(newWarningValidators);
        this.checkValidity();
    }

    /**
     * updates the asynchronous validators of the input
     */
    public setAsyncValidators(
        newAsyncValidators: AsyncValidators<T>,
        newWarningValidators: AsyncValidators<T> = []
    ) {
        this.errorExecuter.setAsyncValidators(newAsyncValidators);
        this.warningExecuter.setAsyncValidators(newWarningValidators);
        this.checkValidity();
    }

    public destroy() {
        this.destroyed.next(undefined);
    }
}

export type Validator<T> = (value: T) => {
    [errorName: string]: StateError<T>;
} | null;

export type Validators<T> = ReadonlyArray<Validator<T>>;

export type AsyncValidator<T> = (value: T) => Observable<{
    [errorName: string]: StateError<T>;
} | null>;
export type AsyncValidators<T> = ReadonlyArray<AsyncValidator<T>>;
