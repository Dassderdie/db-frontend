import type { OnChanges, OnDestroy, TemplateRef } from '@angular/core';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectionStrategy,
} from '@angular/core';
import { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type {
    MetaAttribute,
    Version,
} from '@cache-server/api/versions/version';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { InfiniteScroll } from '@shared/utility/classes/infinite-scroll';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import type { SortingConfig } from '../sorting-config';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays an neat list of all versions matching the specified filter
 * with infiniteScroll
 */
export class SearchResultsComponent
    extends InfiniteScroll<Version>
    implements OnChanges, OnDestroy, Destroyed
{
    /**
     * the filter whose matching versions should be displayed
     */
    @Input() filter!: string | null;
    /**
     * the table in which the versions are saved (table.id === version.tableId)
     */
    @Input() table!: Table;
    /**
     * unique id to store items in the query, if null, no query is used
     */
    @Input() queryId?: string;
    /**
     * an optional Template which will be displayed as the first column
     */
    @Input() firstCol?: TemplateRef<unknown> | null;
    /**
     * an optional Template which should be displayed as the first column in the table-header
     */
    @Input() firstColHeader?: TemplateRef<unknown> | null;
    /**
     * an optional Template which will be displayed as the last column
     */
    @Input() lastCol?: TemplateRef<unknown> | null;
    /**
     * (not expected to change)
     * on emit: load more results
     */
    @Input() readonly loadMore$?: Observable<unknown>;
    /**
     * the height of the viewport in px for the infinity scroll
     */
    @Input() viewportHeight$!: number;
    /**
     * If provided this element is used to determine wether the attribute is visible and should be displayed
     * null -> the root element is the viewport
     */
    @Input() root: HTMLElement | null = null;
    /**
     * !do not mutate the emitted array!
     */
    @Output() readonly versionsChange = new EventEmitter<
        ReadonlyArray<Version>
    >();

    public versionsWrapperElement?: HTMLTableSectionElement;
    public columnOrder: ReadonlyArray<MetaAttribute | UUID> = [];
    readonly destroyed = new Subject();
    public readonly sorting$ = new ReplaySubject<SortingConfig>(1);
    public readonly versionsE$ = this.elements$;
    public readonly totalVersionsCountE$ = this.totalElementCount$;

    constructor(private readonly versionsService: VersionsService) {
        super();
        this.elements$
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.versionsChange);
    }

    getMoreElements(after?: string) {
        return this.sorting$.pipe(
            switchMap(({ sortingKey, sortingOrder }) =>
                this.versionsService.getVersions(
                    this.table.projectId,
                    this.table.id,
                    this.filter,
                    after,
                    sortingKey ?? undefined,
                    sortingOrder ?? undefined
                )
            ),
            map((results) => ({
                elements: results.versions,
                totalElementCount: results.totalVersionCount,
            }))
        );
    }

    protected get loadedElementsHeight() {
        return this.versionsWrapperElement?.offsetHeight ?? 0;
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.filter) {
            this.loadElementsNew();
        }
        if (changes.loadMore$) {
            errors.assert(changes.loadMore$.isFirstChange());
            this.loadMore$
                ?.pipe(takeUntil(this.destroyed))
                .subscribe(() => this.loadMoreElements());
        }
        if (changes.viewportHeight$) {
            this.updateViewportHeight();
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
