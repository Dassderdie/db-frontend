/* eslint-disable unicorn/prefer-query-selector */
import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import * as cytoscape from 'cytoscape';
import { firstValueFrom, merge, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { getVersionDisplayName } from '@shared/utility/functions/get-version-display-name';
import type { Table } from '@cache-server/api/tables/table';
import { TableColorService } from '@tables/core/table-color.service';
import type { Version } from '@cache-server/api/versions/version';
import { MessageService } from '@core/utility/messages/message.service';
import { CytoscapeUtilities } from '@shared/utility/cytoscape-utilities';
import type { ForeignAttributeIdSelection } from '../select-foreign-attributes/foreign-attribute-id-selection';
import { relationExplorerStylesheet } from './relation-explorer-stylesheet';
import { RelationExplorer } from './relation-explorer';

@Component({
    selector: 'app-relation-explorer',
    templateUrl: './relation-explorer.component.html',
    styleUrls: ['./relation-explorer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationExplorerComponent
    extends Destroyed
    implements AfterViewInit, OnInit, OnDestroy
{
    @Input() projectId!: UUID;
    @Input() tableId!: UUID;
    @Input() entryId!: UUID;

    /**
     * the container in which the cytoscape graph should render
     */
    @ViewChild('cyContainer') cyContainer!: ElementRef<HTMLDivElement>;

    /**
     * The tables that are currently in use, for which a user should be able to decided which relations should be considered
     */
    public usedTables: ReadonlyArray<Table> = [];
    private cytoscapeGraph!: cytoscape.Core;
    private relationExplorer!: RelationExplorer;
    // emits every time the cytoscape graph should be redrawn
    private readonly redrawCy$ = new Subject();
    private tables: ReadonlyArray<Table> = [];
    public attributeIdSelection: ForeignAttributeIdSelection = {};
    public inspection?: { readonly version: Version; readonly table: Table };
    public selectedTool: 'expand' | 'inspect' | 'remove' = 'expand';

    constructor(
        private readonly versionsService: VersionsService,
        private readonly tablesService: TablesService,
        private readonly tableColorService: TableColorService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly messageService: MessageService
    ) {
        super();
    }

    async ngOnInit() {
        this.tables = await firstValueFrom(
            this.tablesService.getTables(this.projectId)
        );
        this.relationExplorer = new RelationExplorer(
            this.messageService,
            (tableId: UUID, filter: string) =>
                this.versionsService.getVersions(
                    this.projectId,
                    tableId,
                    filter
                ),
            (tableId: UUID, entryId: UUID) =>
                this.versionsService.getNewestVersion(
                    this.projectId,
                    tableId,
                    entryId
                ),
            this.tables,
            {
                tableId: this.tableId,
                entryId: this.entryId,
            }
        );
        merge(this.relationExplorer.edges$, this.relationExplorer.nodes$)
            .pipe(debounceTime(200), takeUntil(this.destroyed))
            .subscribe(this.redrawCy$);
    }

    ngAfterViewInit() {
        this.cytoscapeGraph = cytoscape({
            // Container to render in
            container: this.cyContainer.nativeElement,
            // Initial viewport state:
            pan: { x: 0, y: 0 },
            zoom: 1,
            // Interaction options:
            userZoomingEnabled: false,
            selectionType: 'single',
            minZoom: 0.5,
            maxZoom: 4,
            autolock: false,
            style: relationExplorerStylesheet,
        });
        this.cytoscapeGraph.on('position', (event) => {
            for (const node of this.relationExplorer!.nodes) {
                node.position = this.cytoscapeGraph
                    .getElementById(node.entryId)
                    .position();
            }
        });
        this.cytoscapeGraph.on('unselect', (event) => {
            this.inspection = undefined;
            this.changeDetectorRef.markForCheck();
        });
        this.redrawCy$.pipe(takeUntil(this.destroyed)).subscribe(() => {
            const nextTableIdsSet = new Set<UUID>();
            for (const node of this.relationExplorer.nodes) {
                nextTableIdsSet.add(node.tableId);
            }
            this.usedTables = [...nextTableIdsSet].map(
                (tableId) => this.tables.find((table) => table.id === tableId)!
            );
            this.changeDetectorRef.markForCheck();
            this.redrawCy();
        });
    }

    private redrawCy() {
        // Reset graph
        this.cytoscapeGraph.remove('edge');
        this.cytoscapeGraph.remove('node');
        errors.assert(!!this.relationExplorer);
        for (const node of this.relationExplorer.nodes) {
            if (!node.version) {
                // the node is not loaded yet and should therefore not be rendered yet
                continue;
            }
            const hasUnexpandedAttributes = Object.keys(
                this.attributeIdSelection[node.tableId] ?? {}
            ).some(
                (attributeId) =>
                    this.attributeIdSelection[node.tableId]![attributeId] ===
                        true && !node.expandedAttributeIds.has(attributeId)
            );
            const displayName = getVersionDisplayName(node.table, node.version);
            const entryNode = this.cytoscapeGraph.add({
                data: {
                    id: node.entryId,
                    entryId: node.entryId,
                    tableId: node.tableId,
                    tableColor: this.tableColorService.getColor(node.table),
                    displayName,
                    hasUnexpandedAttributes,
                    isInitialEntry: node.entryId === this.entryId,
                    selectedTool: this.selectedTool,
                },
                classes: 'node entry',
                position: node.position,
                locked: !!node.position,
            });
            const additionalStyles: cytoscape.Css.Node = {
                width: `${Math.min(
                    CytoscapeUtilities.calculateNodeWidth(
                        this.cytoscapeGraph,
                        displayName,
                        '1em'
                    ) +
                        // for the table-indicator
                        7,
                    200 +
                        // for ellipses
                        8
                )}px`,
            };
            entryNode.style(additionalStyles);
            if (this.inspection?.version.entryId === node.entryId) {
                // this has to be before we register the eventhandler, to not trigger it again
                entryNode.select();
            }
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            entryNode.on('select', (event) => {
                switch (this.selectedTool) {
                    case 'expand':
                        this.relationExplorer.expandNode(
                            node,
                            this.attributeIdSelection[node.tableId] ?? {}
                        );
                        break;
                    case 'remove':
                        if (node.entryId !== this.entryId) {
                            this.relationExplorer.removeNode(node);
                        }
                        break;
                    case 'inspect':
                        errors.assert(!!node.version);
                        this.inspection = {
                            version: node.version,
                            table: node.table,
                        };
                        break;
                }
                this.changeDetectorRef.markForCheck();
            });
        }
        for (const edge of this.relationExplorer.edges) {
            this.cytoscapeGraph.add({
                data: {
                    id: edge.intermediateVersion.entryId,
                    tableId: edge.intermediateVersion.tableId,
                    source: edge.sourceEntryId,
                    target: edge.targetEntryId,
                },
                classes: 'edge',
            });
        }
        this.cytoscapeGraph
            .elements()
            .createLayout(getLayoutOptions(this.entryId))
            .one('layoutstop', () => {
                this.cytoscapeGraph.nodes('*').unlock();
            })
            .run();
    }

    public updateAllowedAttributeIds(
        newAttributeIdSelection: ForeignAttributeIdSelection
    ) {
        this.attributeIdSelection = newAttributeIdSelection;
        if (this.cytoscapeGraph) {
            // Updates hasUnexpandedAttributes for each node
            this.redrawCy();
        }
    }

    public reset() {
        this.relationExplorer.reset();
        this.inspection = undefined;
    }

    public runLayout() {
        this.cytoscapeGraph.nodes('*').unlock();
        this.cytoscapeGraph
            .elements()
            .createLayout(getLayoutOptions(this.entryId))
            .run();
    }

    public fit() {
        CytoscapeUtilities.fit(this.cytoscapeGraph, graphPadding);
    }

    private readonly zoomFactor = 0.5;
    public zoomIn() {
        CytoscapeUtilities.zoomIn(this.cytoscapeGraph, this.zoomFactor);
    }

    public zoomOut() {
        CytoscapeUtilities.zoomOut(this.cytoscapeGraph, this.zoomFactor);
    }

    public selectTool(tool: this['selectedTool']) {
        this.selectedTool = tool;
        this.cytoscapeGraph.elements().data('selectedTool', this.selectedTool);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.relationExplorer.destroy();
        this.cytoscapeGraph.destroy();
    }
}

function getLayoutOptions(entryId: UUID): cytoscape.BreadthFirstLayoutOptions {
    return {
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: graphPadding, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: [entryId], // the roots of the trees
        animate: false, // whether to transition the node positions
        maximalAdjustments: 1000,
    };
}

const graphPadding = 30;
