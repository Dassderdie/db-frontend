import type {
    AfterViewInit,
    OnChanges,
    OnDestroy,
    TemplateRef,
} from '@angular/core';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type {
    MetaAttribute,
    Version,
} from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { MessageService } from '@core/utility/messages/message.service';
import { QueryNavigatorService } from '@core/utility/query-navigator/query-navigator.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { combineLatest } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import type { SortingConfig } from '../sorting-config';
import { QueryStorage } from '../utilities/query-storage';

@Component({
    selector: 'app-versions-list',
    templateUrl: './versions-list.component.html',
    styleUrls: ['./versions-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays an neat list of the versions that are passed to it
 */
export class VersionsListComponent
    extends Destroyed
    implements OnChanges, OnDestroy, AfterViewInit
{
    /**
     * the attributes of the table of the versions
     */
    @Input() attributes!: ReadonlyArray<Attribute>;
    /**
     * The order in which the attributes should be displayed (attribute.id | metaAttribute)
     * if an attribute is not in the array, it wil not be displayed
     */
    @Input() attributeOrder!: ReadonlyArray<MetaAttribute | UUID>;
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
    @Input() versions?: ReadonlyArray<Version> | null;
    /**
     * If provided this element is used to determine wether the attribute is visible and should be displayed
     * null -> the root element is the viewport
     */
    @Input() root: HTMLElement | null = null;
    /**
     * Disables the sorting ui and sortingChanges
     */
    @Input() disableSorting = false;
    /**
     * Emits how the items should be sorted
     */
    @Output() readonly sortingChanges = new EventEmitter<
        Readonly<SortingConfig>
    >();
    /**
     * Emits exactly 1 value
     * The reference to the Body of the table, that provides the offsetHeight of the loaded versions for infiniteScroll
     */
    @Output()
    private readonly versionsWrapperElement = new EventEmitter<HTMLTableSectionElement>();

    @ViewChild('tableBody')
    private readonly tableBody!: ElementRef<HTMLTableSectionElement>;

    constructor(
        public readonly i18nService: I18nService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly queryNavigatorService: QueryNavigatorService,
        private readonly messageService: MessageService
    ) {
        super();
    }

    private sortingKeyStorage?: QueryStorage<SortingConfig['sortingKey']>;
    private sortingOrderStorage?: QueryStorage<SortingConfig['sortingOrder']>;

    public columnOrder: ReadonlyArray<
        MetaAttribute | UUID | 'firstCol' | 'lastCol'
    > = [];
    public showVersionWithId: UUID | null = null;
    public sortingKey?: SortingConfig['sortingKey'];
    public sortingOrder?: SortingConfig['sortingOrder'];

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.queryId) {
            errors.assert(changes.queryId.isFirstChange(), {
                status: 'error',
            });

            this.sortingKeyStorage = new QueryStorage(
                this.queryId ? `order${this.queryId}` : undefined,
                this.activatedRoute,
                this.queryNavigatorService,
                this.messageService,
                (query) => query,
                (value) => value
            );
            this.sortingOrderStorage = new QueryStorage(
                this.queryId ? `sort${this.queryId}` : undefined,
                this.activatedRoute,
                this.queryNavigatorService,
                this.messageService,
                (query) => query as SortingConfig['sortingOrder'],
                (value) => value
            );
            combineLatest([
                this.sortingOrderStorage.value$,
                this.sortingKeyStorage.value$,
            ])
                .pipe(
                    // if both are changed at the same time we don't want 2 requests
                    debounceTime(100),
                    takeUntil(this.destroyed)
                )
                .subscribe(([sortingOrder, sortingKey]) => {
                    this.sortingOrder = sortingOrder;
                    this.sortingKey = sortingKey;
                    this.sortingChanges.emit({
                        sortingKey,
                        sortingOrder,
                    });
                });
        }
        if (changes.attributes) {
            this.sortingKeyStorage!.setValidator((sortingKey) =>
                sortingKey && this.getPossibleColumnKeys().includes(sortingKey)
                    ? sortingKey
                    : null
            );
        }
        if ((this.attributeOrder ?? []).length === 0) {
            this.attributeOrder = this.attributes.map(
                (attribute) => attribute.id
            );
        }
        if (changes.attributeOrder || changes.lastCol || changes.firstCol) {
            this.columnOrder = [
                this.firstCol ? 'firstCol' : '',
                ...this.attributeOrder,
                this.lastCol ? 'lastCol' : '',
            ].filter((col) => !!col);
        }
    }

    ngAfterViewInit() {
        this.versionsWrapperElement.emit(this.tableBody.nativeElement);
    }

    public toggleSortBy(id: MetaAttribute | UUID) {
        this.sortingKeyStorage!.setValue(id);
        this.sortingOrderStorage!.setValue(
            this.sortingKey !== id || this.sortingOrder === 'descending'
                ? 'ascending'
                : 'descending'
        );
    }

    public toggleShowVersion(versionId: UUID) {
        if (this.showVersionWithId === versionId) {
            this.showVersionWithId = null;
        } else {
            this.showVersionWithId = versionId;
        }
    }

    private getPossibleColumnKeys() {
        return [...this.attributes.map((attr) => attr.id), ...metaAttributes];
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.sortingKeyStorage?.destroy();
        this.sortingOrderStorage?.destroy();
    }
}
