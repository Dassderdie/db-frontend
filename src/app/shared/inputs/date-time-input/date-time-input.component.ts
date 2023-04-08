import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Input,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { AbstractTimeControlValidators } from '../shared/abstract-time-control-validators';
import { DateTimeInput } from './date-time-input';

@Component({
    selector: 'app-date-time-input',
    templateUrl: './date-time-input.component.html',
    styleUrls: ['./date-time-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeInputComponent
    extends SpecialInputComponent
    implements OnInit, Destroyed, OnDestroy
{
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: DateTimeInput;

    public readonly destroyed = new Subject();
    public readonly dateInput = new FormControl();
    public readonly timeInput = new FormControl();
    public readonly timeZoneInput = new FormControl('00:00');
    public readonly timeZoneSignInput = new FormControl(
        '+',
        Validators.pattern(/[+-]/u)
    );

    constructor(protected readonly changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.dateInput.setValidators(AbstractTimeControlValidators.date);
        this.timeZoneInput.setValidators(
            AbstractTimeControlValidators.timezone
        );
        this.setTime(this.control.value);
        this.control.value$.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.setTime(this.control.value);
        });
        merge(
            this.dateInput.valueChanges,
            this.timeInput.valueChanges,
            this.timeZoneInput.valueChanges,
            this.timeZoneSignInput.valueChanges
        )
            .pipe(takeUntil(this.destroyed))
            .subscribe(
                () => {
                    this.setValue({
                        date: this.dateInput.value,
                        time: this.timeInput.value,
                        timeZone: this.timeZoneInput.value,
                        timeZoneSign: this.timeZoneSignInput.value,
                    });
                },
                (error: any) => errors.error({ error })
            );
    }

    /**
     * sets the right date-time according to ISO8601 date-time in the valueInput
     * from the 4 inputs: date, time, timeZoneSign and TimeZone
     */
    private setValue(inputValues: {
        // E.g. 2019-10-14 or ''
        date: string | null;
        time: string | null;
        timeZoneSign: string | null;
        timeZone: string | null;
    }): void {
        // 18:15:27.353Z or 18:15:27Z or 18:15+10:00
        let timeValue = inputValues.time;
        if (!inputValues.date) {
            this.control.setValue(null);
            return;
        }
        if (!timeValue) {
            timeValue = '00:00:00.000';
        } else {
            if ((timeValue.match(/:/gu) || []).length < 2) {
                timeValue += ':00.000';
            } else if ((timeValue.match(/./gu) || []).length < 1) {
                timeValue += '.000';
            }
        }
        if (!inputValues.timeZone || inputValues.timeZone === '00:00') {
            this.control.setValue(`${inputValues.date}T${timeValue}Z`);
            return;
        }
        this.control.setValue(
            `${inputValues.date}T${timeValue}${inputValues.timeZoneSign}${inputValues.timeZone}`
        );
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Calculates and sets the input-values for the four inputs (date, time, timeZoneSign and TimeZone)
     * from the value of the valueInput (ISO8601 date-time)
     */
    private setTime(inputValue: string | null): void {
        let timeZone = '00:00';
        let timeZoneSign = '+';
        let time = '';
        let date = '';
        let value = inputValue;
        if (value && inputValue) {
            date = value.slice(0, inputValue.search(/[Tt]/u));
            value = value.slice(inputValue.search(/[Tt]/u));
            time = value.slice(1, value.search(/[+Zz-]/u));
            value = value.slice(value.search(/[+Zz-]/u));
            if (value.length > 1) {
                // If there is a timeZone (not Z)
                timeZone = inputValue.slice(inputValue.search(/[+Zz-]/u));
            }
            timeZoneSign = value.slice(0, 1);
            if (timeZoneSign === 'z' || timeZoneSign === 'Z') {
                timeZoneSign = '+';
                timeZone = '00:00';
            } else {
                timeZone = value.slice(1);
            }
        }
        if (this.dateInput.value !== date) {
            this.dateInput.setValue(date);
        }
        if (this.timeInput.value !== time) {
            this.timeInput.setValue(time);
        }
        if (this.timeZoneInput.value !== timeZone) {
            this.timeZoneInput.setValue(timeZone);
        }
        if (this.timeZoneSignInput.value !== timeZoneSign) {
            this.timeZoneSignInput.setValue(timeZoneSign);
        }
        this.changeDetectorRef.markForCheck();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
