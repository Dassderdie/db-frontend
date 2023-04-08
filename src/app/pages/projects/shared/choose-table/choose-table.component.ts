import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ElementRef,
    NgZone,
} from '@angular/core';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { TablesGraphService } from '@projects/core/tables-graph/tables-graph.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { CytoscapeUtilities } from '@shared/utility/cytoscape-utilities';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import * as cytoscape from 'cytoscape';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-choose-table',
    templateUrl: './choose-table.component.html',
    styleUrls: ['./choose-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays the tables-graph from which the user can select a table
 *
 */
export class ChooseTableComponent
    extends Destroyed
    implements OnDestroy, OnChanges, AfterViewInit
{
    /**
     * the tables that should be displayed in the graph
     * if undefined a loader will be displayed instead
     */
    @Input() tables?: ReadonlyArray<Table> | null;
    /**
     * Wether intermediateTables should be selectable or not
     * This input is not expected to change
     */
    @Input() selectableIntermediateTables!: boolean;
    /**
     * Additional styles for the cytoscape graph
     * This input is not expected to change
     */
    @Input() additionalStyles?: ReadonlyArray<cytoscape.Stylesheet>;
    /**
     * Tables that should be displayed with a specific style
     * {
     *      selectorClass1: arrayOfTableIdsWithThisStyle[]
     * }
     */
    @Input() tableGroups?: {
        readonly [selectorClass: string]: ReadonlyArray<UUID>;
    };
    /**
     * the container in which the cytoscape graph should render
     */
    @ViewChild('cyContainer') cyContainer!: ElementRef<HTMLDivElement>;
    /**
     * the container which is the parent of the cyContainer
     */
    @ViewChild('cyOuterContainer')
    cyOuterContainer!: ElementRef<HTMLDivElement>;
    /**
     * Emits the newly selected table each time the user selects one
     */
    @Output() readonly newTableSelected = new EventEmitter<UUID>();

    private cy!: cytoscape.Core;
    /**
     * Whether the pointer-cursor should be displayed
     */
    public hover = false;

    constructor(
        private readonly tablesGraphService: TablesGraphService,
        private readonly ngZone: NgZone,
        private readonly windowValuesService: WindowValuesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    public resizeCy(event: DragEvent) {
        if (!this.cyOuterContainer) {
            errors.error({ message: 'cyOuterContainer is not defined' });
            return;
        }
        CytoscapeUtilities.resizeCy(
            event,
            this.cyOuterContainer.nativeElement,
            this.cy,
            this.tablesGraphService.minHeight
        );
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (this.cy) {
            if (changes.tables) {
                this.drawTables();
            }
            errors.assert(
                !changes.additionalStyles ||
                    changes.additionalStyles.isFirstChange(),
                {
                    status: 'error',
                    message:
                        'The additionalStyles Input() is not expected to change',
                }
            );
            if (changes.tableGroups) {
                this.updateAdditionalClasses(changes.tableGroups.previousValue);
            }
        }
    }

    ngAfterViewInit() {
        // To fix high cpu usage
        this.ngZone.runOutsideAngular(() => {
            errors.assert(!!this.cyContainer);
            // Register extensions
            this.tablesGraphService.register();
            this.cy = cytoscape({
                container: this.cyContainer.nativeElement,
                // Initial viewport state:
                pan: { x: 0, y: 0 },
                // Interaction options:
                userZoomingEnabled: false,
                userPanningEnabled: false,
                minZoom: 0.5,
                maxZoom: 4,
                autoungrabify: true,
                style: [
                    ...this.tablesGraphService.style,
                    ...(this.additionalStyles ?? []),
                ],
            });
            this.tablesGraphService.registerEdgeNodeListeners(this.cy);
        });
        // Show correct mouse cursor
        this.cy.on('mouseover', 'node', () => {
            this.hover = true;
            // detectChanges instead of markForCheck, because else there is a noticeable delay to the next changeDetectionCycle
            this.changeDetectorRef.detectChanges();
        });
        this.cy.on('mouseout', 'node', () => {
            this.hover = false;
            // detectChanges instead of markForCheck, because else there is a noticeable delay to the next changeDetectionCycle
            this.changeDetectorRef.detectChanges();
        });
        this.cy.on('select', (event) => {
            // run in zone again, because the code depending on this output could rely on it (router.navigate, ...)
            this.ngZone.run(() =>
                this.newTableSelected.next(
                    // eslint-disable-next-line no-underscore-dangle
                    event.target._private.data.id as UUID
                )
            );
        });
        this.drawTables();
        this.updateAdditionalClasses();
        combineLatest([
            this.windowValuesService.viewportHeight$,
            this.windowValuesService.viewportWidth$,
        ])
            .pipe(
                distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
                takeUntil(this.destroyed)
            )
            .subscribe(() =>
                CytoscapeUtilities.fit(
                    this.cy,
                    this.tablesGraphService.fitPadding
                )
            );
    }

    private updateAdditionalClasses(
        previousTableGroups?: ChooseTableComponent['tableGroups']
    ) {
        if (previousTableGroups) {
            for (const selectorClass of Object.keys(previousTableGroups)) {
                this.cy.elements().removeClass(selectorClass);
            }
        }
        // apply new classes
        if (this.tableGroups) {
            for (const [selectorClass, tableGroup] of Object.entries(
                this.tableGroups
            )) {
                for (const tableId of tableGroup) {
                    // eslint-disable-next-line unicorn/prefer-query-selector
                    this.cy.getElementById(tableId).addClass(selectorClass);
                }
            }
        }
    }

    private drawTables() {
        this.tablesGraphService.drawTables(
            this.cy,
            this.tables ?? [],
            false,
            this.selectableIntermediateTables
        );
        this.tablesGraphService.runLayout(this.cy);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        this.cy?.destroy();
    }
}
