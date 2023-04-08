import { Injectable } from '@angular/core';
import { InfiniteScroll } from '@shared/utility/classes/infinite-scroll';
import type { Observable } from 'rxjs';
import { ReplaySubject, fromEvent, merge, of } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs/operators';
import { Breakpoints } from './breakpoints';

@Injectable({
    providedIn: 'root',
})
/**
 * A service exporting different observables of values of the window, viewport etc.
 */
export class WindowValuesService {
    constructor() {
        // ViewportWidth
        const viewportWidthE$ = new ReplaySubject<number>(1);
        merge(
            of(window.innerWidth),
            fromEvent(window, 'resize').pipe(
                map(() => window.innerWidth),
                debounceTime(200)
            )
        )
            .pipe(distinctUntilChanged())
            .subscribe(viewportWidthE$);
        this.viewportWidth$ = viewportWidthE$.asObservable();
        // ViewportHeight
        const viewportHeightE$ = new ReplaySubject<number>(1);
        merge(
            of(window.innerHeight),
            fromEvent(window, 'resize').pipe(
                map(() => window.innerHeight),
                debounceTime(200)
            )
        )
            .pipe(distinctUntilChanged())
            .subscribe(viewportHeightE$);
        this.viewportHeight$ = viewportHeightE$.asObservable();
        // Responsive breakpoints
        this.responsiveBreakpoint$ = this.viewportWidth$.pipe(
            map((width) => {
                if (width < 576) {
                    return Breakpoints.xs;
                }
                if (width < 768) {
                    return Breakpoints.sm;
                }
                if (width < 992) {
                    return Breakpoints.md;
                }
                if (width < 1200) {
                    return Breakpoints.lg;
                }
                return Breakpoints.xl;
            }),
            distinctUntilChanged()
        );
        this.responsiveBreakpoint$.subscribe((breakpoint) => {
            this.currentBreakpoint = breakpoint;
        });
    }

    /**
     * an observable emitting the width of the viewport in px
     */
    public readonly viewportWidth$: Observable<number>;
    /**
     * an observable emitting the height of the viewport in px
     */
    public readonly viewportHeight$: Observable<number>;
    /**
     * an observable emitting the minimum breakpoint that hasn't been reached yet
     * (equivalent to bootstraps breakpoints)
     * (use the breakpoints enum)
     */
    public readonly responsiveBreakpoint$: Observable<Breakpoints>;
    /**
     * the minimum breakpoint that hasn't been reached yet
     */
    public currentBreakpoint: Breakpoints = Breakpoints.xl;
    /**
     * emits always when the user scrolls in the window
     */
    public readonly scrollEvent$: Observable<Event> = fromEvent(
        window,
        'scroll'
    ).pipe(debounceTime(200));
    /**
     * an observable always emitting when the user reaches the (near) end of the page
     * useful for infinite scrolling
     */
    public readonly endOfWindowReached$: Observable<unknown> =
        this.scrollEvent$.pipe(
            filter(
                (event) =>
                    // Height of the whole rendered document - (viewport height + distance scrolled)
                    document.documentElement.scrollHeight -
                        (window.innerHeight + window.scrollY) <
                    InfiniteScroll.scrollBuffer
            )
        );
}
