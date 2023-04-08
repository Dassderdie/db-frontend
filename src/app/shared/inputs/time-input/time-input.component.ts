import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractTimeControlValidators } from '../shared/abstract-time-control-validators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { TimeInput } from './time-input';

@Component({
    selector: 'app-time-input',
    templateUrl: './time-input.component.html',
    styleUrls: ['./time-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeInputComponent
    extends SpecialInputComponent
    implements OnInit, Destroyed, OnDestroy
{
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: TimeInput;

    public readonly timeInput = new FormControl();
    public readonly timeZoneInput = new FormControl('00:00');
    public readonly timeZoneSignInput = new FormControl(
        '+',
        Validators.pattern(/[+-]/u)
    );
    readonly destroyed = new Subject();

    ngOnInit() {
        this.timeZoneInput.setValidators(
            AbstractTimeControlValidators.timezone
        );
        this.setTime();
        this.control.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.setTime());
        merge(
            this.timeInput.valueChanges,
            this.timeZoneInput.valueChanges,
            this.timeZoneSignInput.valueChanges
        )
            .pipe(takeUntil(this.destroyed))
            .subscribe(
                () => this.setValue(),
                (error: any) => errors.error({ error })
            );
    }

    /**
     * sets the right time according to ISO8601 full-time in the control
     * from the 3 inputs: time, timeZoneSign and TimeZone
     */
    private setValue(): void {
        let timeValue: string = this.timeInput.value;
        if (!timeValue) {
            this.control.setValue(null);
            return;
        }
        if ((timeValue.match(/:/gu) || []).length < 2) {
            timeValue += ':00.000';
        } else if ((timeValue.match(/./gu) || []).length < 1) {
            timeValue += '.000';
        }
        const timeZoneSign: string = this.timeZoneSignInput.value;
        const timeZone: string = this.timeZoneInput.value;
        if (!timeZone || timeZone === '00:00') {
            this.control.setValue(`${timeValue}Z`);
            return;
        }
        this.control.setValue(timeValue + timeZoneSign + timeZone);
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Calculates and sets the input-values for the three inputs (time, timeZoneSign and TimeZone)
     * from the value (ISO8601 full-time)
     */
    private setTime(): void {
        let timeZone = '00:00';
        let timeZoneSign = '+';
        let time = '';
        let value = this.control.value;
        if (value && this.control.value) {
            time = value.slice(0, value.search(/[+Zz-]/u));
            value = value.slice(value.search(/[+Zz-]/u));
            if (value.length > 1) {
                // If there is a timeZone (not Z)
                timeZone = this.control.value.slice(
                    this.control.value.search(/[+Zz-]/u)
                );
            }
            timeZoneSign = value.slice(0, 1);
            if (timeZoneSign === 'z' || timeZoneSign === 'Z') {
                timeZoneSign = '+';
                timeZone = '00:00';
            } else {
                timeZone = value.slice(1);
            }
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
