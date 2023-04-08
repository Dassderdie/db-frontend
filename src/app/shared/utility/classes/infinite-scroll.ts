import type { UUID } from '@cache-server/api/uuid';
import type { Observable, Subscription } from 'rxjs';
import { merge, Subject, ReplaySubject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';
import type { DeepReadonly } from '../types/deep-readonly';

export abstract class InfiniteScroll<Element extends { id: string }> {
    /**
     * the unique id of the last loaded element
     */
    private get lastId(): UUID | undefined {
        return this.elements?.[this.elements.length - 1]?.id;
    }

    /**
     * should emit when the component gets destroyed to correctly unsubscribe from all streams
     */
    protected abstract readonly destroyed: Observable<unknown>;
    /**
     * the height in px of all elements combined
     * (to determine wether the whole viewport is filled)
     *
     * ```typescript
     * @ViewChild('domElement', { static: false }) domElement?: ElementRef<
     *     HTMLElement
     * >;
     * protected get loadedElementsHeight() {
     *      // 0 when dom isn't rendered yet
     *      return this.domElement?.nativeElement?.offsetHeight ?? 0;
     * }
     */
    protected abstract loadedElementsHeight: number;
    /**
     * the height in px of the whole viewport that should be filled
     * number if it is static
     * observable if it can change (like 100vh when the window is resized)
     */
    protected abstract viewportHeight$: Observable<number> | number;

    /**
     * emits every time the elements get reloaded
     * (e.g. for unsubscribing previous loading observables)
     */
    protected readonly allElementsReloaded$ = new Subject();
    /**
     * emits every time the first results (lastId = undefined) receives an update
     * (e.g. for unsubscribing previous loading observables)
     */
    protected readonly firstResultsUpdate$ = new Subject();
    /**
     * the array of the elements that should be displayed
     * if undefined no elements have been loaded yet
     */
    protected elements?: DeepReadonly<Element[]>;
    private readonly elementsE$ = new ReplaySubject<DeepReadonly<Element[]>>(1);
    /**
     * emits every time elements get loaded
     * !do not mutate the emitted array!
     */
    protected readonly elements$ = this.elementsE$.asObservable();
    /**
     * the amount of elements that can be loaded at most
     */
    protected totalElementCount?: number;
    private readonly totalElementCountE$ = new ReplaySubject<number>(1);
    /**
     * emits every time the totalElementCount gets updated
     */
    protected readonly totalElementCount$ =
        this.totalElementCountE$.asObservable();
    private currentViewportHeight = 0;
    /**
     * the latest id for which a request has been made
     * (to prevent trying to load the same elements multiple times)
     */
    private latestLastIdUsed?: UUID;
    /**
     * whether all elements are loaded
     */
    public readonly allElementsLoaded?: boolean;
    public readonly allElementsLoaded$: Observable<boolean> = new ReplaySubject(
        1
    );
    private updateAllElementsLoaded() {
        (this.allElementsLoaded as boolean | undefined) =
            !!this.elements &&
            this.totalElementCount !== undefined &&
            this.elements.length >= this.totalElementCount;
        (this.allElementsLoaded$ as ReplaySubject<boolean>).next(
            this.allElementsLoaded!
        );
    }
    /**
     * @param after if after == undefined -> load new, else -> load elements after the element with the id of the value
     */
    protected abstract getMoreElements(after?: string): Observable<{
        elements: DeepReadonly<Element[]>;
        totalElementCount: number;
    }>;

    /**
     * loads all elements again and fills the viewport
     */
    protected loadElementsNew() {
        if (!this.elements) {
            // On first load of elements
            this.updateViewportHeight();
        }
        this.totalElementCount = undefined;
        this.latestLastIdUsed = undefined;
        this.allElementsReloaded$.next(undefined);
        this.getMoreElements()
            .pipe(
                map((value, index) => {
                    if (index > 0) {
                        // if the first elements should have a new value then all elements should be renewed
                        this.loadElementsNew();
                    }
                    return value;
                }),
                takeUntil(merge(this.destroyed, this.allElementsReloaded$))
            )
            .subscribe(
                (results) => {
                    if (
                        this.totalElementCount !== undefined &&
                        this.totalElementCount !== results.totalElementCount
                    ) {
                        this.firstResultsUpdate$.next(undefined);
                    }
                    this.totalElementCount = results.totalElementCount;
                    this.elements = results.elements;
                    // Wait until the view updates
                    setTimeout(() => this.fillViewport(), 0);
                    this.elementsE$.next(this.elements);
                    this.totalElementCountE$.next(this.totalElementCount);
                    this.updateAllElementsLoaded();
                },
                (error: any) => errors.error({ error })
            );
    }

    /**
     * loads more elements
     *
     * example function which should be called onScroll event and determines wether more elements should be loaded
     * ```typescript
     * onScroll(event: any) {
     *    // visible height + pixel scrolled >= total height
     *    if (event.target.offsetHeight + event.target.scrollTop + InfiniteScroll.scrollBuffer >= event.target.scrollHeight) {
     *        loadMore();
     *    }
     * }
     * ```
     */
    protected loadMoreElements() {
        if (this.allElementsLoaded || this.lastId === this.latestLastIdUsed) {
            return;
        }
        this.latestLastIdUsed = this.lastId;
        if (!this.lastId) {
            errors.error({
                message:
                    'lastId is undefined (loadElementsNew should always come before loadMoreElements)',
            });
            return;
        }
        this.getMoreElements(this.lastId)
            .pipe(
                // the first getMoreElements should trigger a reload for all/any other elements
                first(),
                takeUntil(
                    merge(
                        this.destroyed,
                        this.firstResultsUpdate$,
                        this.allElementsReloaded$
                    )
                )
            )
            .subscribe({
                next: (results) => {
                    if (!this.elements) {
                        errors.error({
                            message:
                                'elements are undefined (loadElementsNew should always come before loadMoreElements)',
                        });
                        this.elements = [];
                    }
                    if (
                        this.totalElementCount !==
                        results.totalElementCount + this.elements.length
                    ) {
                        errors.error({
                            message: 'Corrupted elements!',
                            logValues: {
                                elements: this.elements,
                                totalElementCount: this.totalElementCount,
                                results,
                            },
                        });
                    }
                    this.elements = [...this.elements, ...results.elements];
                    // Wait until the view updates (+ delay a bit)
                    setTimeout(() => this.fillViewport(), 500);
                    this.elementsE$.next(this.elements);
                    this.totalElementCountE$.next(this.totalElementCount!);
                    this.updateAllElementsLoaded();
                },
                error: (error: any) => errors.error({ error }),
            });
    }

    /**
     * height in pixel of how much the viewport should be overloaded
     */
    public static scrollBuffer = 200;

    /**
     * loads as much elements that the viewport is at least filled
     */
    private fillViewport() {
        // Load more elements if viewport is not filled yet
        if (
            !this.allElementsLoaded &&
            this.loadedElementsHeight <
                this.currentViewportHeight + InfiniteScroll.scrollBuffer
        ) {
            this.loadMoreElements();
        }
    }

    private viewportHeight$Subscription?: Subscription;

    /**
     * triggers the correct filling of the viewport if needed
     */
    protected updateViewportHeight() {
        this.viewportHeight$Subscription?.unsubscribe();
        if (typeof this.viewportHeight$ === 'object') {
            this.viewportHeight$Subscription = this.viewportHeight$
                .pipe(takeUntil(this.destroyed))
                .subscribe((viewportHeight) => {
                    this.currentViewportHeight = viewportHeight;
                    this.fillViewport();
                });
        } else {
            this.currentViewportHeight = this.viewportHeight$;
            this.fillViewport();
        }
    }
}
