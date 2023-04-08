import type { AfterContentInit } from '@angular/core';
import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
    selector: '[appAutoFocus]',
})
export class AutoFocusDirective implements AfterContentInit {
    @Input('appAutoFocus') public autoFocus!: boolean;

    public constructor(private readonly elementRef: ElementRef) {}

    public ngAfterContentInit() {
        // check multipole times to make sure the element is rendered?
        this.focus();
        setTimeout(() => this.focus(), 0);
    }

    private focus() {
        if (this.autoFocus) {
            this.elementRef.nativeElement.focus();
        }
    }
}
