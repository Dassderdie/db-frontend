import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ContentChild,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { AttributeFilter } from '@cache-server/api/versions/attribute-filter';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { Version } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { InfiniteScroll } from '@shared/utility/classes/infinite-scroll';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { combineLatest, Subject, ReplaySubject } from 'rxjs';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { presentForeignRelationsFilter } from '../present-foreign-relations-filter';

@Component({
    selector: 'app-display-foreign-many',
    templateUrl: './display-foreign-many.component.html',
    styleUrls: ['./display-foreign-many.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * a wrapper (*ngFor) for all foreign-relations that match a specific filter
 * by default: display all relations present on the specified version for the specified attribute
 * a template provided (displayForeignItem) represents each relation
 * in addition to the inputs of this component the following variables can be used inside this template
 * first: inherit from *ngFor
 * last: inherit from *ngFor
 * intermediateVersion: the intermediateVersion that should be displayed
 * intermediateTable: the table of the intermediate entry
 * isVisible: wether the item is visible to the user
 * -> use this for performance optimisation/lazy-loading
 * -> if it is false you should nevertheless display sth. (loading spinner etc.)
 * else all items are
 *
 * @example ```html
 *  <app-display-foreign-many [attribute]="attribute" [version]="version">
 *      <ng-template
 *          let-first="first"
 *          let-last="last"
 *          let-isVisible="isVisible"
 *          let-intermediateVersion="intermediateVersion"
 *          let-intermediateTable="intermediateTable"
 *      >
 *          <ng-container *ngIf="isVisible; else loading">
 *              <!-- Whatever -->
 *          </ng-container>
 *          <ng-template #loading>
 *              <!-- A loading placeholder in the same size of Whatever -->
 *           </ng-template>
 *      </ng-template>
 *  </app-display-foreign-many>
 * ```
 */
export class DisplayForeignManyComponent
    extends InfiniteScroll<Version>
    implements OnChanges, OnInit, OnDestroy, Destroyed
{
    /**
     * the foreignAttribute whose value should be displayed
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version from which the foreign value should be displayed
     */
    @Input() version!: Version;

    // No default value but instead optional, to make a conditional use of a custom-filter or the default one much simpler
    /**
     * a custom function that returns the filter which is used to load the relations
     * by default all relations present on the specified version for the specified attribute are loaded
     */
    @Input() createFilterFunction?: CreateFilterFunction;
    /**
     * This template gets shown, when there are no intermediateVersions
     */
    @Input() emptyTemplate?: TemplateRef<any>;
    /**
     * A translation key, the number of relations is located directly in front of it
     */
    @Input() numberOfTranslationsKey = _(
        'shared.versions.foreign.display-foreign-many.number-of-relations'
    );

    /**
     * emits how many versions can be loaded in total
     */
    @Output()
    readonly totalForeignVersionCountChanges = new EventEmitter<number>();

    @ContentChild(TemplateRef)
    public readonly displayForeignItem!: TemplateRef<unknown>;
    @ViewChild('displayForeignItems')
    protected readonly displayForeignItems?: ElementRef<HTMLElement>;

    public readonly intermediateVersions$ = this.elements$;
    public readonly numberOfRelations$ = this.totalElementCount$;
    readonly destroyed = new Subject();
    /**
     * key: id of an intermediateVersion
     * value: wether this version is visible (is in the viewport)
     */
    public isVisible: { [intermediateVersionId: string]: boolean } = {};

    protected get loadedElementsHeight() {
        return this.displayForeignItems?.nativeElement.offsetHeight ?? 0;
    }
    public readonly viewportHeight$ = 400;
    public readonly intermediateTableE$ = new ReplaySubject<IntermediateTable>(
        1
    );

    constructor(
        private readonly versionsService: VersionsService,
        private readonly tablesService: TablesService
    ) {
        super();
    }

    private readonly latestValuesE$ = new ReplaySubject<
        [Version, ForeignAttribute, string]
    >(1);

    protected getMoreElements(after?: string) {
        if (!after) {
            // elements are loaded new
            this.isVisible = {};
        }
        return this.latestValuesE$.pipe(
            switchMap(([version, attribute, filter]) =>
                this.versionsService.getVersions(
                    version.projectId,
                    attribute.kindOptions.intermediateTableId,
                    filter,
                    after
                    // TODO:
                    // this.sortingKey,
                    // this.sortingOrder
                )
            ),
            map((results) => ({
                elements: results.versions,
                totalElementCount: results.totalVersionCount,
            })),
            tap((results) => {
                if (!after) {
                    this.totalForeignVersionCountChanges.emit(
                        results.totalElementCount
                    );
                }
            })
        );
    }

    ngOnInit() {
        // Because the default value of createFilterFunction doesn't trigger onChanges
        this.createFilterFunctionE$.next(
            this.createFilterFunction ?? presentForeignRelationsFilter
        );
        // get values for intermediateTableE$
        combineLatest([this.versionE$, this.attributeE$])
            .pipe(
                switchMap(([version, attribute]) =>
                    this.tablesService
                        .getTable(
                            version.projectId,
                            attribute.kindOptions.intermediateTableId
                        )
                        .pipe(
                            map((table) => {
                                errors.assert(table.type === 'intermediate');
                                return table;
                            })
                        )
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(this.intermediateTableE$);
        // correctly create the filters and load the elements
        combineLatest([
            this.createFilterFunctionE$,
            this.intermediateTableE$,
            this.versionE$,
            this.attributeE$,
        ])
            .pipe(
                map(
                    ([
                        createFilterFunction,
                        intermediateTable,
                        version,
                        attribute,
                    ]) => {
                        const ownAttributeId = getForeignEntryAttributeIds(
                            intermediateTable,
                            version.tableId,
                            attribute.id
                        ).entryAttributeId;
                        const filter = JSON.stringify(
                            createFilterFunction(ownAttributeId, version)
                        );
                        return [version, attribute, filter] as [
                            Version,
                            ForeignAttribute,
                            string
                        ];
                    }
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(this.latestValuesE$);
        this.latestValuesE$.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.loadElementsNew();
        });
    }

    private readonly createFilterFunctionE$ =
        new ReplaySubject<CreateFilterFunction>(1);
    private readonly versionE$ = new ReplaySubject<Version>(1);
    private readonly attributeE$ = new ReplaySubject<ForeignAttribute>(1);

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.createFilterFunction) {
            this.createFilterFunctionE$.next(this.createFilterFunction!);
        }
        if (changes.version) {
            this.versionE$.next(this.version);
        }
        if (changes.attribute) {
            this.attributeE$.next(this.attribute);
        }
    }

    /**
     * loads more elements with infinite scroll when the user reaches the end of scrolling
     * @param event the scroll-event
     */
    public onScroll(event: any) {
        // Visible height + pixel scrolled >= total height
        if (
            event.target.offsetHeight +
                event.target.scrollTop +
                InfiniteScroll.scrollBuffer >=
            event.target.scrollHeight
        ) {
            this.loadMoreElements();
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.attributeE$.complete();
        this.createFilterFunctionE$.complete();
        this.versionE$.complete();
        this.intermediateTableE$.complete();
        this.latestValuesE$.complete();
    }
}

type CreateFilterFunction = (
    ownAttributeId: UUID,
    version: Version
) => AttributeFilter | FilterGroup;
