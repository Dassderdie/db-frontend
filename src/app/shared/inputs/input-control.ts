import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { ValidatorState } from '@shared/utility/classes/state/validator-state';
import type { Writable } from '@shared/utility/types/writable';
import type { Observable } from 'rxjs';
import { merge, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class InputControl<
    T = boolean | number | string | null
> extends ValidatorState<T> {
    constructor(
        /**
         * an unique id of the input
         */
        public readonly name: string,
        initialValue: T,
        /**
         * the synchronous validators which determine wether the input is invalid or valid
         * persistent: these validators will not be affected by setValidators
         * adjustable: these validators will be removed and set again by setValidators
         * !no two validators (async and sync combined) can produce the same error!
         */
        validators: {
            persistent?: Validators<T>;
            adjustable?: Validators<T>;
            persistentWarnings?: Validators<T>;
            adjustableWarnings?: Validators<T>;
        } = { persistent: [], adjustable: [] },
        /**
         * the asynchronous validators which determine wether the input is invalid or valid
         * persistent: these validators will not be affected by setAsyncValidators
         * adjustable: these validators will be removed and set again by setAsyncValidators
         * !no two validators (async and sync combined) can produce the same error!
         */
        asyncValidators: {
            persistent?: AsyncValidators<T>;
            adjustable?: AsyncValidators<T>;
            persistentWarnings?: AsyncValidators<T>;
            adjustableWarnings?: AsyncValidators<T>;
        } = { persistent: [], adjustable: [] },
        firstCurrentValue = initialValue,
        /**
         * @returns wether two values of the input are equal
         */
        private readonly equals: (value1: T, value2: T) => boolean = (
            v1: T,
            v2: T
        ) => v1 === v2
    ) {
        super(validators, asyncValidators);
        // To trigger the side effects
        this.setInitialValue(initialValue);
        this.setValue(firstCurrentValue);
        // If the initialValue or the firstCurrentValue are null and the value or initialValue are null/undefined
        // Too no change is detected and therefore would no value emitted
        if (this.cleanValue(initialValue) === null) {
            (this.initialValue$ as ReplaySubject<T>).next(this.initialValue);
        }
        if (this.cleanValue(firstCurrentValue) === null) {
            (this.value$ as ReplaySubject<T>).next(this.value);
        }
        merge(this.value$, this.initialValue$)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this.setChanged(!this.equals(this.initialValue, this.value));
            });
    }

    /**
     * replaces unwanted values like '' or undefined with null
     * @param value
     */
    protected cleanValue<U>(value: U): U {
        if (value === ('' as unknown as U) || value === undefined) {
            return null as unknown as U;
        }
        return value;
    }

    /**
     * the current value of the input
     */
    public readonly value!: T;
    public readonly value$: Observable<T> = new ReplaySubject(1);
    public setValue(newValue: T) {
        const valueToBeSet = this.cleanValue(newValue);
        // If the value hasn't changed
        if (this.equals(this.value, valueToBeSet)) {
            return;
        }
        // Set value
        (this.value as Writable<this['value']>) = valueToBeSet;
        (this.value$ as ReplaySubject<T>).next(valueToBeSet);
        this.checkValidity();
    }

    /**
     * the value the input will reset to and determine its changed-status
     */
    public readonly initialValue!: T;
    public readonly initialValue$: Observable<T> = new ReplaySubject(1);
    public setInitialValue(newInitialValue: T) {
        const initialValueToBeSet = this.cleanValue(newInitialValue);
        if (!this.equals(this.initialValue, initialValueToBeSet)) {
            (this.initialValue as Writable<this['initialValue']>) =
                initialValueToBeSet;
            (this.initialValue$ as ReplaySubject<T>).next(this.initialValue);
        }
    }

    /**
     * wether the value is different from the initialValue
     */
    public readonly changed!: boolean;
    public readonly changed$: Observable<boolean> = new ReplaySubject(1);
    public setChanged(newChanged: boolean) {
        if (this.changed !== newChanged) {
            (this.changed as this['changed']) = newChanged;
            (this.changed$ as ReplaySubject<boolean>).next(this.changed);
        }
    }

    /**
     * wether the user has at anytime focused this input
     */
    public readonly touched = false;
    public readonly touched$: Observable<boolean> = new ReplaySubject(1);
    public setTouched(newTouched: boolean) {
        if (this.touched !== newTouched) {
            (this.touched as boolean) = newTouched;
            (this.touched$ as ReplaySubject<boolean>).next(this.touched);
        }
    }

    /**
     * wether the user has at anytime changed this inputs value himself
     */
    public readonly dirty = false;
    public readonly dirty$: Observable<boolean> = new ReplaySubject(1);
    public setDirty(newDirty: boolean) {
        if (this.dirty !== newDirty) {
            (this.dirty as boolean) = newDirty;
            (this.dirty$ as ReplaySubject<boolean>).next(this.dirty);
        }
    }

    /**
     * wether the user should not be able to set values
     */
    public readonly disabled = false;
    public readonly disabled$: Observable<boolean> = new ReplaySubject(1);
    public setDisabled(newDisabled: boolean) {
        if (this.disabled !== newDisabled) {
            (this.disabled as boolean) = newDisabled;
            (this.disabled$ as ReplaySubject<boolean>).next(this.disabled);
        }
    }

    /**
     * resets the value of the input to its initialValue
     */
    public resetValue() {
        this.setValue(this.initialValue);
    }
}
