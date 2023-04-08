import type { OnChanges, OnDestroy, TemplateRef } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { StringInput } from '../string-input/string-input';
import { RealStringInput } from './real-string-input';

@Component({
    selector: 'app-real-string-input',
    templateUrl: './real-string-input.component.html',
    styleUrls: ['./real-string-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealStringInputComponent
    extends SpecialInputComponent
    implements OnChanges, Destroyed, OnDestroy
{
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: RealStringInput;

    readonly destroyed = new Subject();
    public stringInput?: StringInput;
    /**
     * wether the inputs value is null or an (potentially empty) string
     */
    public isNotNull = false;
    /**
     * wether the checkbox giving the user the ability to decide between null and an empty string should be disabled,
     * because the string value is not null
     */
    public notNullCheckboxDisabled = false;
    private readonly newStringInput$ = new Subject();

    constructor(private readonly changeDetectionRef: ChangeDetectorRef) {
        super(changeDetectionRef);
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (!changes.control) {
            return;
        }
        this.newStringInput$.next(undefined);
        if (this.stringInput) {
            this.stringInput.destroy();
        }
        this.stringInput = new StringInput(
            `${this.control.name}string`,
            this.control.initialValue ? this.control.initialValue : null,
            {
                kind: 'string',
                disabled: this.control.disabled,
                placeholder: this.control.placeholder,
                firstCurrentValue: this.control.value
                    ? this.control.value
                    : null,
            }
        );
        this.control.value$
            .pipe(takeUntil(merge(this.destroyed, this.newStringInput$)))
            .subscribe((newValue) => {
                this.isNotNull = newValue !== null;
                if (this.stringInput) {
                    this.stringInput.setValue(newValue);
                } else {
                    errors.error({ message: 'The StringInput is undefined' });
                }
            });
        this.control.initialValue$
            .pipe(takeUntil(merge(this.destroyed, this.newStringInput$)))
            .subscribe((newInitialValue) => {
                if (this.stringInput) {
                    // Empty string will be replaced automatically with null in the StringInput itself
                    this.stringInput.setInitialValue(newInitialValue);
                } else {
                    errors.error({
                        message: 'The StringInput is undefined',
                    });
                }
            });
        this.stringInput.value$
            .pipe(takeUntil(merge(this.destroyed, this.newStringInput$)))
            .subscribe((stringValue) => {
                if (stringValue) {
                    this.isNotNull = true;
                    this.notNullCheckboxDisabled = true;
                } else {
                    this.notNullCheckboxDisabled = false;
                }
                this.recalculateValue();
                this.changeDetectionRef.markForCheck();
            });
        super.ngOnChanges(changes);
    }

    /**
     * recalculates the value of the RealStringInput
     */
    private recalculateValue() {
        if (this.stringInput) {
            if (this.stringInput.value) {
                this.control.setValue(this.stringInput.value);
            } else {
                this.control.setValue(this.isNotNull ? '' : null);
            }
        } else {
            errors.error({
                message: 'The StringInput is undefined',
            });
            this.control.setValue(null);
            this.isNotNull = false;
        }
    }

    public changeIsNotNull(event: Event) {
        this.control.setDirty(true);
        this.isNotNull = (event?.target as any)?.checked;
        this.recalculateValue();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
