import type { Writable } from '@shared/utility/types/writable';
import { cloneDeep, isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { merge, ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import type { StateErrors } from './state-error';
import type { AsyncValidators, Validators } from './validator-state';

/**
 * This class executes validators and exposes the resulting state properties invalid and hasWarning
 * and additional properties
 */
export class ValidatorExecuter<T> {
    /**
     * all current errors from the sync and async validators
     */
    public readonly errors: StateErrors<T> = {};
    public readonly errors$: Observable<StateErrors<T>> = new ReplaySubject(1);
    private setErrors(newErrors: StateErrors<T>) {
        if (this.errors !== newErrors) {
            (this.errors as Writable<StateErrors<T>>) = newErrors;
            (this.errors$ as ReplaySubject<StateErrors<T>>).next(this.errors);
        }
    }

    /**
     * Wether there are asyncValidators pending
     */
    public readonly pending = false;
    public readonly pending$: Observable<boolean> = new ReplaySubject(1);
    private updatePending() {
        const newPending = this.asyncValidatorsPending > 0;
        if (this.pending !== newPending) {
            (this.pending as boolean) = newPending;
            (this.pending$ as ReplaySubject<boolean>).next(newPending);
        }
    }

    /**
     * Wether the value is not a valid one
     */
    public readonly hasError!: boolean;
    public readonly invalid$: Observable<boolean> = new ReplaySubject(1);
    private setHasError(newHasError: boolean) {
        if (this.hasError !== newHasError) {
            (this.hasError as this['hasError']) = newHasError;
            (this.invalid$ as ReplaySubject<boolean>).next(newHasError);
        }
    }

    /**
     * emits always when checkValidity is called
     */
    private readonly validate = new Subject();
    /**
     * the number of asyncValidators that have not yet emitted something for the current value
     */
    private asyncValidatorsPending = 0;

    /**
     * a dictionary that keeps track of the latest errors an asyncValidator has emitted
     * the key is the index of the asyncValidator in the asyncValidators array
     * the value are all names (= keys in this.errors) of the emitted errors
     * if the asyncValidator hasn't emitted an error (yet) it is not in here
     */
    private asyncErrorDict: {
        [asyncValidatorIndex: number]: string[];
    } = {};

    constructor(
        private readonly destroyed: Observable<unknown>,
        private readonly getValue: () => T,
        /**
         * the synchronous validators which determine wether the state hasError s
         * persistent: these validators will not be affected by setValidators
         * adjustable: these validators will be removed and set again by setValidators
         * !two validators (async and sync combined) mustn't produce the same error!
         */
        private readonly validators: {
            persistent?: Validators<T>;
            adjustable?: Validators<T>;
        },
        /**
         * the asynchronous validators which determine wether the input is invalid or valid
         * persistent: these validators will not be affected by setAsyncValidators
         * adjustable: these validators will be removed and set again by setAsyncValidators
         * !two validators (async and sync combined) mustn't produce the same error!
         */
        private readonly asyncValidators: {
            persistent?: AsyncValidators<T>;
            adjustable?: AsyncValidators<T>;
        }
    ) {}

    /**
     * updates the adjustable synchronous validators of the input
     */
    public setValidators(newValidators?: Validators<T>) {
        this.validators.adjustable = newValidators;
        this.checkValidity();
    }

    /**
     * updates the asynchronous validators of the input
     */
    public setAsyncValidators(newAsyncValidators: AsyncValidators<T>) {
        this.asyncValidators.adjustable = newAsyncValidators;
        this.checkValidity();
    }

    /**
     * applies all validators to the current value
     */
    public checkValidity() {
        const value = this.getValue();
        this.validate.next(undefined);
        let errors: StateErrors<T> = {};
        this.asyncErrorDict = {};
        // Apply synchronous validators
        const validators = [
            ...(this.validators.persistent ?? []),
            ...(this.validators.adjustable ?? []),
        ];
        for (const validator of validators) {
            const validatorError = validator(value);
            if (validatorError) {
                errors = {
                    ...errors,
                    ...validatorError,
                };
            }
        }
        const asyncValidators = [
            ...(this.asyncValidators.persistent ?? []),
            ...(this.asyncValidators.adjustable ?? []),
        ];
        this.setErrors(errors);
        if (asyncValidators.length > 0) {
            // As long as the async validators are pending the input is invalid (will be updated as soon as the first asyncValidator emits)
            this.setHasError(true);
        } else {
            this.setHasError(!isEmpty(this.errors));
        }
        // Apply asynchronous validators
        this.asyncValidatorsPending = asyncValidators.length;
        this.updatePending();
        const asyncValidatorObservables: Observable<
            Readonly<{
                // The (unique) index of the asyncValidator
                key: number;
                // The validation error
                validationError: StateErrors<T> | null;
            }>
        >[] = [];
        for (const [i, validator] of asyncValidators.entries()) {
            asyncValidatorObservables.push(
                validator(value).pipe(
                    // Reduce number of pending asyncValidators on the first emit
                    map((v, index) => {
                        if (index === 0) {
                            this.asyncValidatorsPending--;
                            this.updatePending();
                        }
                        return { key: i, validationError: v };
                    }),
                    takeUntil(merge(this.destroyed, this.validate))
                )
            );
        }
        merge(...asyncValidatorObservables)
            .pipe(takeUntil(merge(this.destroyed, this.validate)))
            .subscribe(({ key, validationError }) => {
                const newErrors = cloneDeep(this.errors);
                // Remove all errors this asyncValidator has already emitted
                const alreadyEmittedErrors = this.asyncErrorDict[key];
                if (alreadyEmittedErrors) {
                    // We assume there are no two validators (async + sync ones combined) that emit the same error
                    for (const error of alreadyEmittedErrors) {
                        delete newErrors[error];
                    }
                }
                if (validationError) {
                    // Add the new errors to the dictionary
                    this.asyncErrorDict[key] = Object.keys(validationError);
                }
                this.setErrors({
                    ...newErrors,
                    ...validationError,
                });
                // The invalid property can only switch to false if no asyncValidator is pending anymore
                this.setHasError(
                    this.asyncValidatorsPending > 0 || !isEmpty(this.errors)
                );
            });
    }
}
