import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appCapsLockOn]',
})
export class CapsLockOnDirective {
    @Output() readonly appCapsLockOn = new EventEmitter<boolean>();

    private currentCapsLock = false;

    // disable: max-line-length
    @HostListener('window:keydown', ['$event']) onKeyDown(
        event: KeyboardEvent
    ) {
        this.updateCapsLock(event);
    }
    // disable: max-line-length
    @HostListener('window:keyup', ['$event']) onKeyUp(event: KeyboardEvent) {
        this.updateCapsLock(event);
    }
    private updateCapsLock(event: KeyboardEvent) {
        const capsOn = event.getModifierState?.('CapsLock');

        if (capsOn !== this.currentCapsLock) {
            this.currentCapsLock = capsOn;
            this.appCapsLockOn.emit(capsOn);
        }
    }
}
