import {
    ComponentFactoryResolver,
    ViewContainerRef,
    Directive,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import { LoadingDirective } from './loading-directive';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[ngIfWithLoading]',
})
/**
 * This is like a normal *ngIf but instead of an arbitrary else-template a loading-placeholder with
 * `inline = false` is shown
 * @usageNotes
 * ```
 * <some-element *ngIf="condition; withLoading">
 *      ...
 * </some-element>
 * ```
 */
export class WithLoadingDirective extends LoadingDirective {
    @Input() set ngIf(condition: any) {
        this.setNgIf(condition, false);
    }

    // angular needs this constructor here to inject the services
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        viewContainerRef: ViewContainerRef,
        componentFactoryResolver: ComponentFactoryResolver,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(viewContainerRef, componentFactoryResolver, changeDetectorRef);
    }
}
