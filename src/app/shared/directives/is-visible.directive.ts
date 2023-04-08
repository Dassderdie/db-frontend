import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Directive,
    EventEmitter,
    Input,
    Output,
    ElementRef,
} from '@angular/core';

@Directive({
    selector: '[appIsVisible]',
})
/**
 * Make sure that you use this only on HTMLElements - not e.g. <ng-container>
 */
export class IsVisibleDirective implements OnDestroy, OnChanges {
    /**
     * The viewport in which the element is positioned
     * null: browser viewport
     * undefined: deactivate the tracking (e.g. for performance reasons)
     */
    @Input('appIsVisible') root: HTMLElement | null | undefined;
    @Input() debounce = 0;
    @Input() margin = '100px 10px';
    @Input() threshold: number[] | number = [0, 1];
    /**
     * Emits wether the element incl. margin is visible in the provided root-viewport (based on threshold and debounce)
     */
    @Output()
    readonly isVisibleChanges = new EventEmitter<boolean>();

    constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

    private intersectionObserver?: IntersectionObserver;
    private lastIsIntersectingValue?: boolean;

    ngOnChanges() {
        this.intersectionObserver?.disconnect();
        if (this.root === undefined) {
            return;
        }
        // the values should be remitted if viewport changed or similar (to solve bugs with trackBy lists and emptied isVisible-Dictionary)
        this.lastIsIntersectingValue = undefined;
        this.intersectionObserver = new IntersectionObserver(
            (observerEntries) => {
                const nextIsIntersectingValue = observerEntries.some(
                    (observerEntry) => observerEntry.isIntersecting
                );
                if (nextIsIntersectingValue !== this.lastIsIntersectingValue) {
                    this.isVisibleChanges.next(nextIsIntersectingValue);
                    this.lastIsIntersectingValue = nextIsIntersectingValue;
                }
            },
            {
                root: this.root,
                rootMargin: this.margin,
                threshold: this.threshold,
            }
        );
        this.intersectionObserver.observe(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.intersectionObserver?.disconnect();
        this.isVisibleChanges.complete();
    }
}
