import {
    Directive,
    EventEmitter,
    HostListener,
    Output,
    ElementRef,
} from '@angular/core';

@Directive({
    selector: '[appOutsideClick]',
})
export class OutsideClickDirective {
    @Output() readonly outsideClick: EventEmitter<null> = new EventEmitter();

    constructor(private readonly elementRef: ElementRef) {}

    @HostListener('document:click', ['$event.target']) onMouseEnter(
        targetElement: unknown
    ) {
        if (!this.elementRef.nativeElement.contains(targetElement)) {
            this.outsideClick.emit(null);
        }
    }
}
