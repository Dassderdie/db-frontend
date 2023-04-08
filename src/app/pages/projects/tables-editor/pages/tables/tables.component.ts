/* eslint-disable unicorn/prefer-query-selector */
import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
    Component,
    ViewChild,
    ChangeDetectorRef,
    ElementRef,
    ChangeDetectionStrategy,
    NgZone,
} from '@angular/core';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import type { GridGuideCytoscape } from '@projects/core/tables-graph/grid-options';
import { TablesGraphService } from '@projects/core/tables-graph/tables-graph.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { CytoscapeUtilities } from '@shared/utility/cytoscape-utilities';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import * as cytoscape from 'cytoscape';
import { Subject, forkJoin, merge, of } from 'rxjs';
import { auditTime, filter, first, switchMap, takeUntil } from 'rxjs/operators';
import { convertTableToEditTable } from '../editable-table';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent
    extends DeactivationDirective
    implements AfterViewInit, OnDestroy, Destroyed
{
    /**
     * the container in which the cytoscape graph should render
     */
    @ViewChild('cyContainer') cyContainer!: ElementRef<HTMLDivElement>;
    /**
     * the container which is the parent of the cyContainer
     */
    @ViewChild('cyOuterContainer')
    cyOuterContainer!: ElementRef<HTMLDivElement>;
    readonly destroyed = new Subject();
    public tables?: ReadonlyArray<Table>;
    private selectedTable?: UUID;
    /**
     * whether the pointer-cursor should be displayed
     */
    public hover = false;
    /**
     * whether the grab-cursor should be displayed
     */
    public grab = false;
    /**
     * 0: no changes have been made
     * 1: at least one node, that had no specified coordinates has now exact coordinates
     * 2: at least one node, that had exact coordinates now has different
     */
    public graphChanged = 0;
    private readonly redraw = new Subject<unknown>();
    private cy!: GridGuideCytoscape;
    /**
     * whether the table-positions should freeze (e.g. during saving)
     */
    public freeze = false;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly tablesService: TablesService,
        private readonly tablesGraphService: TablesGraphService,
        private readonly ngZone: NgZone,
        private readonly changeDetectorRef: ChangeDetectorRef,
        confirmationModalService: ConfirmationModalService
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => this.graphChanged === 2);
    }

    ngAfterViewInit() {
        // To fix high cpu usage
        this.ngZone.runOutsideAngular(() => {
            errors.assert(!!this.cyContainer);
            // Register extensions
            this.tablesGraphService.register();
            // Initialize cytoscape
            this.cy = cytoscape({
                // Container to render in
                container: this.cyContainer.nativeElement,
                // Initial viewport state:
                pan: { x: 0, y: 0 },
                // Interaction options:
                userZoomingEnabled: false,
                minZoom: 0.5,
                maxZoom: 4,
                autolock: false,
                style: this.tablesGraphService.style,
            }) as GridGuideCytoscape;
            this.tablesGraphService.registerEdgeNodeListeners(this.cy);
        });
        this.cy.gridGuide(this.tablesGraphService.gridGuideOptions);
        this.redraw
            .pipe(auditTime(200), takeUntil(this.destroyed))
            .subscribe(() => {
                this.cy.resize();
                // TODO: improve workaround
                this.cy.gridGuide({ drawGrid: false });
                this.cy.gridGuide({ drawGrid: true });
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
        this.cy.on('grab', () => {
            this.grab = true;
            // detectChanges instead of markForCheck, because else there is a noticeable delay to the next changeDetectionCycle
            this.changeDetectorRef.detectChanges();
        });
        this.cy.on('free', () => {
            this.grab = false;
            // detectChanges instead of markForCheck, because else there is a noticeable delay to the next changeDetectionCycle
            this.changeDetectorRef.detectChanges();
        });
        this.cy.on('tap', (event) => {
            if (event.target === this.cy) {
                this.cy.elements('*').unselect();
                this.ngZone.run(() => this.selectOtherTable('new'));
            }
        });
        this.cy.on('select', (event) => {
            // eslint-disable-next-line no-underscore-dangle
            this.ngZone.run(() =>
                this.selectOtherTable(event.target._private.data.id)
            );
        });
        this.cy.on('position', () => {
            errors.assert(!!this.tables);
            this.graphChanged = 0;
            for (const table of this.tables) {
                if (table.type !== 'default') {
                    continue;
                }
                const initialPos = table.coordinates;
                if (
                    (initialPos.x === null || initialPos.y === null) &&
                    this.graphChanged < 1
                ) {
                    this.graphChanged = 1;
                } else {
                    const currentPos = this.cy
                        .getElementById(table.id)
                        .position();
                    if (
                        currentPos &&
                        (initialPos.x !== currentPos.x ||
                            initialPos.y !== currentPos.y)
                    ) {
                        this.graphChanged = 2;
                    }
                }
            }
            this.changeDetectorRef.markForCheck();
        });

        this.activatedRoute.params
            .pipe(
                switchMap((params) =>
                    this.tablesService.getTables(params.project)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((tables) => {
                this.tables = cloneDeepWritable(tables);
                if (this.graphChanged !== 2) {
                    this.resetPositions();
                }
                if (this.selectedTable && this.selectedTable !== 'new') {
                    this.cy.getElementById(this.selectedTable).select();
                }
                this.changeDetectorRef.markForCheck();
            });
        // Show correct table as selected
        merge(
            // Initial route
            of(1),
            // If route changes
            this.router.events.pipe(
                filter((event) => event instanceof NavigationEnd)
            )
        )
            .pipe(
                switchMap(
                    () => this.activatedRoute.firstChild?.params ?? of({})
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(
                (params) => {
                    this.cy.filter('*').unselect();
                    this.selectedTable = params.table;
                    if (this.selectedTable) {
                        this.cy.getElementById(this.selectedTable).select();
                    }
                    this.changeDetectorRef.markForCheck();
                },
                (error: any) => errors.error({ error })
            );
    }

    public selectOtherTable(tableId: UUID) {
        this.selectedTable = tableId;
        if (tableId !== 'new') {
            this.router.navigate([tableId], {
                relativeTo: this.activatedRoute,
            });
        } else {
            this.router.navigate(['.', 'new'], {
                relativeTo: this.activatedRoute,
            });
        }
    }

    public runLayout(shuffle: boolean) {
        if (shuffle) {
            this.cy.nodes('*').unlock();
        }
        this.redraw.next(undefined);
        this.tablesGraphService.runLayout(this.cy);
    }

    public resetPositions() {
        if (this.freeze || !this.tables) {
            return;
        }
        this.tablesGraphService.drawTables(this.cy, this.tables, true, false);
        this.runLayout(false);
    }

    public savePositions() {
        if (this.freeze || !this.tables) {
            return;
        }
        this.freeze = true;
        this.cy.autolock(true);
        const responses: Promise<Table>[] = [];
        for (const table of cloneDeepWritable(this.tables)) {
            if (table.type !== 'default') {
                continue;
            }
            const tableNodePos = this.cy.getElementById(table.id).position();
            if (
                tableNodePos &&
                (table.coordinates.x !== tableNodePos.x ||
                    table.coordinates.y !== tableNodePos.y)
            ) {
                table.coordinates = tableNodePos;
                responses.push(
                    this.tablesService.editTable(
                        convertTableToEditTable(table),
                        false
                    )
                );
            }
        }
        forkJoin(responses)
            .pipe(first(), takeUntil(this.destroyed))
            .subscribe(
                (tables) => {
                    this.messageService.postMessage({
                        color: 'success',
                        title: _(
                            'pages.tables-editor.save-positions.success-message.title'
                        ),
                        body: _(
                            'pages.tables-editor.save-positions.success-message.body'
                        ),
                    });
                    // updateTables resolves after the tables have already been updated
                    this.unfreeze();
                    this.tablesService.updateTables(tables[0]!.projectId);
                    this.changeDetectorRef.markForCheck();
                },
                (error: any) => {
                    errors.error(error);
                    this.unfreeze();
                    this.changeDetectorRef.markForCheck();
                }
            );
    }

    private unfreeze() {
        this.graphChanged = 0;
        this.cy.autolock(false);
        this.freeze = false;
    }

    public fit() {
        CytoscapeUtilities.fit(this.cy, this.tablesGraphService.fitPadding);
        this.redraw.next(undefined);
    }

    public resizeCy(event: DragEvent) {
        errors.assert(!!this.cyOuterContainer);
        CytoscapeUtilities.resizeCy(
            event,
            this.cyOuterContainer.nativeElement,
            this.cy,
            this.tablesGraphService.minHeight
        );
        this.redraw.next(undefined);
    }

    public zoomIn() {
        CytoscapeUtilities.zoomIn(this.cy, this.tablesGraphService.zoomFactor);
    }

    public zoomOut() {
        CytoscapeUtilities.zoomOut(this.cy, this.tablesGraphService.zoomFactor);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        // TODO: [@typescript-eslint/eslint-plugin@>=5.0]: Maybe this bug is then fixed
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        this.cy?.destroy();
    }
}
