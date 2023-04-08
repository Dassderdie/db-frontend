import { Directive, Input, ChangeDetectorRef } from '@angular/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { InputControl } from '../input-control';

// See https://stackoverflow.com/questions/63126067/class-is-using-angular-features-but-is-not-decorated-please-add-an-explicit-ang
@Directive()
export abstract class SpecialInputComponent extends Destroyed {
    abstract control: InputControl<any>;
    /**
     * Whether the input should be focused on init
     */
    @Input() autofocus = false;
    /**
     * Whether the changed-status should be visualized
     */
    @Input() showChanged = false;
    /**
     * When the error message should be displayed
     */
    @Input() displayValidationOn: boolean | 'always' | 'dirty' | 'touched' =
        'always';

    constructor(protected readonly changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    public showValidation = false;

    private validatingSubscription?: Subscription;

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.displayValidationOn) {
            this.validatingSubscription?.unsubscribe();
            if (typeof this.displayValidationOn === 'boolean') {
                this.showValidation = this.displayValidationOn;
            } else if (this.displayValidationOn === 'always') {
                this.showValidation = true;
            } else if (this.displayValidationOn === 'touched') {
                this.validatingSubscription = this.control.touched$
                    .pipe(takeUntil(this.destroyed))
                    .subscribe((touched) => {
                        this.showValidation = touched;
                        this.changeDetectorRef.markForCheck();
                    });
            } else if (this.displayValidationOn === 'dirty') {
                this.validatingSubscription = this.control.dirty$
                    .pipe(takeUntil(this.destroyed))
                    .subscribe((dirty) => {
                        this.showValidation = dirty;
                        this.changeDetectorRef.markForCheck();
                    });
            }
            this.changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
