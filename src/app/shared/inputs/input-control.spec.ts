import { fakeAsync, tick } from '@angular/core/testing';
import type { AsyncValidator } from '@shared/utility/classes/state/validator-state';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { first, pairwise } from 'rxjs/operators';
import { InputControl } from './input-control';
import { CustomValidators } from './shared/validation/custom-validators';

describe('InputControl', () => {
    let control!: InputControl<any>;

    it('should be created', () => {
        control = new InputControl('name', 12345);
        expect(control).toBeTruthy();
    });

    it('should set and keep the correct initialProperties', fakeAsync(() => {
        const initialValue = 1111;
        const currentValue = 1222;
        const name = 'name';
        control = new InputControl(
            name,
            initialValue,
            undefined,
            undefined,
            currentValue
        );
        expect(control.initialValue).toBe(initialValue);
        expect(control.value).toBe(currentValue);
        expect(control.changed).toBe(true);
        expect(control.invalid).toBe(false);
        expect(control.name).toBe(name);
        tick();
        expect(control.initialValue).toBe(initialValue);
        expect(control.value).toBe(currentValue);
        expect(control.changed).toBe(true);
        expect(control.invalid).toBe(false);
        expect(control.name).toBe(name);
    }));

    it('emits the correct currentValue', () => {
        const values = [0, 1];
        let valueChangeNr = 0;
        control = new InputControl('name', values[0]);
        control.value$.subscribe((value) => {
            expect(value).toBe(values[valueChangeNr]);
        });
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        control.value$.pipe(first()).subscribe((value) => {
            expect(value).toBe(values[valueChangeNr]);
        });
    });

    it('correctly cleans the value', () => {
        control = new InputControl('name', '');
        expect(control.value).toBe(null);
        expect(control.initialValue).toBe(null);
        control.setValue(undefined);
        expect(control.value).toBe(null);
        control.setValue(0);
        expect(control.value).toBe(0);
    });

    it('correctly resets the value', () => {
        const initialValue = 12;
        control = new InputControl(
            'name',
            initialValue,
            undefined,
            undefined,
            14
        );
        control.resetValue();
        expect(control.value).toBe(initialValue);
        expect(control.value).toBe(control.initialValue);
    });

    it('emits changed at the beginning', (doneCallback) => {
        control = new InputControl('name', 1);
        expect(control.changed).toBe(false);
        control.changed$.subscribe((changed) => {
            expect(changed).toBe(false);
            doneCallback();
        });
    });

    it('emits the changed value', () => {
        const values = [0, 1, 2, 0];
        let valueChangeNr = 0;
        control = new InputControl('name', values[0]);
        control.changed$.subscribe((changed) => {
            expect(changed).toBe(values[0] !== values[valueChangeNr]);
            expect(changed).toBe(control.changed);
        });
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        control.changed$.pipe(first()).subscribe((changed) => {
            expect(changed).toBe(true);
        });
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        control.changed$.pipe(first()).subscribe((changed) => {
            expect(changed).toBe(false);
        });
    });

    it('does not emit the same value twice in a row', () => {
        const values = [0, 1, 2, 2, 1, 0];
        control = new InputControl('name', values[0]);
        control.value$.pipe(pairwise()).subscribe((valueArray) => {
            expect(valueArray[0]).not.toBe(valueArray[1]);
        });
        for (let i = 1; i < values.length; i++) {
            control.setValue(values[i]);
        }
    });

    it('does not emit the same changed status twice in a row', () => {
        const values = [0, 1, 2, 0];
        control = new InputControl('name', values[0]);
        control.changed$.pipe(pairwise()).subscribe((changedArray) => {
            expect(changedArray[0]).not.toBe(changedArray[1]);
        });
        for (let i = 1; i < values.length; i++) {
            control.setValue(values[i]);
        }
    });

    // TODO: move to validatorState

    it('emits invalid at the beginning', (doneCallback) => {
        control = new InputControl('name', 0);
        expect(control.invalid).toBe(false);
        control.invalid$.subscribe((invalid) => {
            expect(invalid).toBe(false);
            doneCallback();
        });
    });

    it('does not emit the same invalid status twice in a row', () => {
        const values = [0, -1, -2, 0] as const;
        control = new InputControl('name', values[0], {
            persistent: [CustomValidators.min(0)],
        });
        control.changed$.pipe(pairwise()).subscribe((invalidArray) => {
            expect(invalidArray[0]).not.toBe(invalidArray[1]);
        });
        for (let i = 1; i < values.length; i++) {
            control.setValue(values[i]);
        }
    });

    it('emits the invalid status correctly', () => {
        const values = [0, -11, 2] as const;
        let valueChangeNr = 0;
        control = new InputControl('name', values[0], {
            persistent: [CustomValidators.min(0)],
        });
        control.invalid$.subscribe((invalid) => {
            expect(invalid).toBe(values[valueChangeNr]! < 0);
            expect(invalid).toBe(control.invalid);
        });
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        control.invalid$.pipe(first()).subscribe((invalid) => {
            expect(invalid).toBe(true);
        });
        valueChangeNr++;
        control.setValue(values[valueChangeNr]);
        control.invalid$.pipe(first()).subscribe((invalid) => {
            expect(invalid).toBe(false);
        });
    });

    it('correctly sets the errors', () => {
        control = new InputControl('name', -1, {
            persistent: [CustomValidators.min(0), CustomValidators.required()],
        });
        expect(Object.keys(control.getErrors())).toEqual(['min']);
        control.setValue(null);
        expect(Object.keys(control.getErrors())).toEqual(['required']);
    });

    it('correctly change the validators', () => {
        control = new InputControl('name', null, {
            persistent: [CustomValidators.min(0)],
        });
        control.setValidators([CustomValidators.required()]);
        expect(control.getErrors().required).toBeTruthy();
    });

    it('always changes the errors reference', () => {
        control = new InputControl('name', -1, {
            persistent: [CustomValidators.min(0)],
        });
        const firstErrors = control.getErrors();
        control.setValidators([CustomValidators.min(2)]);
        expect(control.getErrors()).not.toBe(firstErrors);
    });

    it('correctly sets the pending state', fakeAsync(() => {
        const asyncValidator$: ReturnType<AsyncValidator<number | null>> &
            Subject<any> = new Subject();
        control = new InputControl<number | null>(
            'name',
            null,
            { persistent: [CustomValidators.min(0)] },
            { persistent: [(value) => asyncValidator$] }
        );
        // TODO: why is this tick needed?
        tick();
        expect(control.getInvalidPending()).toBe(true);
        asyncValidator$.next(null);
        expect(control.getInvalidPending()).toBe(false);
        tick();
        expect(control.getInvalidPending()).toBe(false);
    }));

    it('applies async validators correctly', fakeAsync(() => {
        const asyncValidator$: BehaviorSubject<any> &
            ReturnType<AsyncValidator<number | null>> = new BehaviorSubject({
            errorName: {
                value: null,
                translationKey: 'error',
            },
        });
        control = new InputControl<number | null>('name', null, undefined, {
            persistent: [(value) => asyncValidator$],
        });
        expect(control.invalid).toBe(true);
        expect(Object.keys(control.getErrors())).toEqual(['errorName']);
        tick();
        expect(control.invalid).toBe(true);
        expect(Object.keys(control.getErrors())).toEqual(['errorName']);
        asyncValidator$.next(null);
        expect(control.invalid).toBe(false);
        expect(control.getErrors()).toEqual({});
        tick();
        expect(control.invalid).toBe(false);
        expect(control.getErrors()).toEqual({});
    }));

    it('correctly changes the asyncValidators', fakeAsync(() => {
        control = new InputControl('name', null, undefined, {
            adjustable: [
                (value) =>
                    of({
                        errorName: {
                            value: null,
                            translationKey: 'error',
                        },
                    }),
            ],
        });
        expect(control.invalid).toBe(true);
        expect(Object.keys(control.getErrors())).toEqual(['errorName']);
        control.setAsyncValidators([(value) => of(null)]);
        expect(control.invalid).toBe(false);
        expect(control.getErrors()).toEqual({});
        tick();
        expect(control.invalid).toBe(false);
        expect(control.getErrors()).toEqual({});
    }));
});
