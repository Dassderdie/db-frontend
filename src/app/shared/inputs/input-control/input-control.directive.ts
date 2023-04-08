import type { OnDestroy, OnInit } from '@angular/core';
import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { takeUntil } from 'rxjs/operators';
import { InputControl } from '../input-control';

@Directive({
    selector: '[appInputControl]',
})
/**
 * the connection between inputControls and the actual DOM-elements (input/select/textarea)
 * always keeps the values in sync
 */
export class InputControlDirective<T = boolean | number | string | null>
    extends Destroyed
    implements OnDestroy, OnInit
{
    /**
     * the inputControl that should be bind to the input
     */
    @Input('appInputControl') control!: InputControl<T>;

    constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {
        super();
    }

    /**
     * update the value of the inputControl if the value of the element changes
     */
    @HostListener('input') onInputChange() {
        let newValue: T;
        switch (
            this.elementRef.nativeElement.type as
                | 'checkbox'
                | 'date'
                | 'email'
                | 'file'
                | 'number'
                | 'password'
                | 'text'
                | 'textarea'
                | 'time'
                | 'url'
        ) {
            case 'checkbox':
                newValue = this.elementRef.nativeElement
                    .checked as unknown as T;
                break;
            case 'textarea':
            case 'text':
            case 'password':
            case 'email':
            case 'url':
            case 'time':
            case 'date':
                newValue = this.elementRef.nativeElement.value as unknown as T;
                break;
            case 'number': {
                const numberValue = this.elementRef.nativeElement.valueAsNumber;
                newValue = (
                    Number.isNaN(numberValue) ? null : (numberValue as unknown)
                ) as T;
                break;
            }
            default:
                newValue = this.elementRef.nativeElement.value as unknown as T;
                errors.error({
                    message: `the input type ${this.elementRef.nativeElement.type} is unknown`,
                });
                break;
        }
        this.control.setDirty(true);
        this.control.setValue(newValue);
    }

    /**
     * update the status of the control if the user focuses the input
     */
    @HostListener('focus') focus() {
        this.control.setTouched(true);
    }

    ngOnInit() {
        // Update the value of the element if the value of the inputControl changes
        this.control.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe((newValue) => {
                const type = this.elementRef.nativeElement.type as
                    | 'checkbox'
                    | 'date'
                    | 'email'
                    | 'file'
                    | 'number'
                    | 'password'
                    | 'text'
                    | 'time';
                if (type === 'checkbox') {
                    this.elementRef.nativeElement.checked = !!newValue;
                }
                // For consistency: remove tailing and leading whitespace manually, because browsers handle this differently
                if (type === 'email' && typeof newValue === 'string') {
                    this.elementRef.nativeElement.value = newValue.trim();
                }
                this.elementRef.nativeElement.value =
                    newValue === null ? '' : String(newValue);
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
