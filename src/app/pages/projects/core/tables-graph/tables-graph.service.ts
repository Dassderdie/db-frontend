import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { I18nService } from '@core/utility/i18n/i18n.service';
import * as cytoscape from 'cytoscape';
// @ts-expect-error there are no type declarations available
import fcose from 'cytoscape-fcose';
// @ts-expect-error there are no type declarations available
import gridGuide from 'cytoscape-grid-guide';
import { colors } from 'src/app/style-variables';
import { CytoscapeUtilities } from '@shared/utility/cytoscape-utilities';
import type { GridGuideOptions } from './grid-options';

@Injectable({
    providedIn: 'root',
})
export class TablesGraphService {
    constructor(
        private readonly i18nService: I18nService,
        private readonly domSanitizer: DomSanitizer
    ) {}
    /**
     * wether cy extensions have already been registered (call this.register() to do so)
     */
    private registered = false;
    /**
     * the minimum height of the cyContainer
     */
    public readonly minHeight = 280;

    public readonly gridGuideOptions: GridGuideOptions = {
        /* From the following four snap options, at most one should be true at a given time */
        snapToGridOnRelease: true, // Snap to grid on release
        snapToGridDuringDrag: true, // Snap to grid during drag
        snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
        snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
        distributionGuidelines: false, // Distribution guidelines
        geometricGuideline: false, // Geometric guidelines
        initPosAlignment: false, // Guideline to initial mouse position
        centerToEdgeAlignment: false, // Center to edge alignment
        resize: false, // Adjust node sizes to cell sizes
        parentPadding: true, // Adjust parent sizes to cell sizes by padding
        drawGrid: true, // Draw grid background

        // General
        gridSpacing: 50, // Distance between the lines of the grid.

        // Draw Grid
        zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
        panGrid: true, // Determines whether the grid should move then the user moves the graph if grid is drawn.
        gridStackOrder: -1, // Namely z-index
        gridColor: colors['gray-300'], // Color of grid lines
        lineWidth: 1, // Width of grid lines

        // Parent Padding
        parentSpacing: -1, // -1 to set paddings of parents to gridSpacing
    };

    /**
     * the stylesheet for the graph
     */
    public readonly style: cytoscape.Stylesheet[] = [
        // User interaction with the global graph
        {
            selector: 'core',
            style: {
                'selection-box-opacity': 0,
                'active-bg-color': 'transparent',
                'active-bg-opacity': 0,
                'active-bg-size': 0,
                'selection-box-color': 'transparent',
                'selection-box-border-color': 'transparent',
                'selection-box-border-width': 0,
                'outside-texture-bg-color': 'transparent',
                'outside-texture-bg-opacity': 0,
            },
        },
        {
            selector: 'node',
            style: {
                'background-color': colors.white,
                'border-width': '1px',
                'border-color': colors.primary,
                'padding-left': '10px',
                'padding-right': '10px',
                'overlay-color': colors.primary,
                'overlay-padding': 2,
                color: colors.primary,
            },
        },
        {
            // A foreign-relation
            selector: 'edge',
            style: {
                width: 2,
                'curve-style': 'bezier',
                'line-color': colors['gray-500'],
                'overlay-color': colors.white,
                'overlay-padding': 0,
                'source-arrow-color': colors['gray-500'],
                'target-arrow-color': colors['gray-500'],
                'source-arrow-shape': 'triangle',
                'target-arrow-shape': 'triangle',
            },
        },
        {
            // A foreign attribute
            selector: 'edge[displayName]',
            style: {
                label: 'data(displayName)',
                'text-rotation': 0,
                'text-outline-color': colors.light,
                'text-outline-width': '0.04em',
                'font-size': '0.6em',
                'font-weight': 'lighter',
            },
        },
        {
            selector: '[foreignRelationshipMax <= 1]',
            style: { 'source-arrow-shape': 'none' },
        },
        {
            selector: '[relationshipMax <= 1]',
            style: { 'target-arrow-shape': 'none' },
        },
        {
            selector: 'node.edgeNode',
            style: {
                'border-width': 0,
                width: 1,
                height: 1,
                opacity: 0,
                'padding-bottom': '0px',
                'padding-left': '0px',
                'padding-top': '0px',
                'padding-right': '0px',
            },
        },
        {
            // A table
            selector: 'node[displayName]',
            style: {
                label: 'data(displayName)',
                shape: 'round-rectangle',
                'text-halign': 'center',
                'text-valign': 'center',
                'text-wrap': 'wrap',
                // 'text-max-width': '10vw',
                'font-size': fontSize,
                'font-weight': 'normal',
            },
        },
        {
            // The currently selected element
            selector: 'node:selected',
            style: {
                'border-color': colors.primary,
                'border-width': 3,
                'border-opacity': 0.5,
                // text decorations (underline) are not supported (See https://github.com/cytoscape/cytoscape.js/issues/1909)
                'font-weight': 'bolder',
            },
        },
        {
            // The currently selected element
            selector: 'edge:selected',
            style: {
                'line-color': colors.primary,
                width: 3,
                opacity: 0.5,
                // text decorations (underline) are not supported (See https://github.com/cytoscape/cytoscape.js/issues/1909)
                'font-weight': 'bolder',
                // for some odd reason all 4have to be specified...
                'target-arrow-color': colors.primary,
                'source-arrow-color': colors.primary,
                'mid-target-arrow-color': colors.primary,
                'mid-source-arrow-color': colors.primary,
            },
        },
        {
            // a table whose position has been changed
            selector: '.positionChanged',
            style: {
                'border-color': colors.warning,
            },
        },
        {
            // a table whose position hasn't been set yet and is therefore calculated by the layout
            selector: '.positionUnset',
            style: {
                'border-color': colors.secondary,
            },
        },
    ];

    /**
     * Padding on fit() of a cy graph
     */
    public readonly fitPadding = 20;
    public readonly zoomFactor = 0.5;
    readonly edgeNodePostfix = 'edgeNode';

    public readonly layoutOptions: (
        stopFunct: (event: unknown) => void
    ) => cytoscape.LayoutOptions = (stopFunct) => ({
        name: 'fcose',
        // 'draft', 'default' or 'proof'
        // - "draft" only applies spectral layout
        // - "default" improves the quality with incremental layout (fast cooling rate)
        // - "proof" improves the quality with incremental layout (slow cooling rate)
        quality: 'proof',
        // Use random node positions at beginning of layout
        // if this is set to false, then quality option must be "proof"
        randomize: false,
        // Whether or not to animate the layout
        animate: false,
        // Easing of animation, if enabled
        animationEasing: undefined,
        // Fit the viewport to the repositioned nodes
        fit: true,
        // Padding around layout
        padding: this.fitPadding,
        // Whether to include labels in node dimensions. Valid in "proof" quality
        nodeDimensionsIncludeLabels: true,
        // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
        uniformNodeDimensions: false,
        /* spectral layout options */
        // False for random, true for greedy sampling
        samplingType: true,
        // Sample size to construct distance matrix
        sampleSize: 1000,
        // Separation amount between nodes
        nodeSeparation: 50,
        // Power iteration tolerance
        piTol: 0.0000001,
        /* incremental layout options */
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 4500,
        // Ideal edge (non nested) length
        idealEdgeLength: 100,
        // Divisor to compute edge forces
        edgeElasticity: 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Maximum number of iterations to perform
        numIter: 25000,
        // For enabling tiling
        tile: false,
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation
        tilingPaddingVertical: 50,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation
        tilingPaddingHorizontal: 50,
        // Gravity force (constant)
        gravity: 1,
        // Gravity range (constant)
        gravityRange: 100,
        // Initial cooling factor for incremental layout
        initialEnergyOnIncremental: 0.6,
        stop: stopFunct, // on layoutstop
    });

    /**
     * register extensions, when they are not already registered
     * should be called before the instantiation of any cy object
     */
    public register() {
        if (!this.registered) {
            cytoscape.use(gridGuide);
            cytoscape.use(fcose);
            this.registered = true;
        }
    }

    /**
     * Has to be called shortly after the the instantiation of the cy
     * to allow edgeNodes to work correctly
     * @param cy
     */
    public registerEdgeNodeListeners(cy: cytoscape.Core) {
        // edges do not emit a position event -> listen to the nodes and wait until the edges are updated
        cy.on('position', 'node', (e) => {
            (e.target as cytoscape.NodeSingular)
                .connectedEdges()
                .forEach((edge) => {
                    const edgeNode = this.getEdgeNode(cy, edge);
                    if (!edgeNode) {
                        return;
                    }
                    const midpoint = this.getEdgeMidpoint(edge);
                    if (midpoint) {
                        edgeNode.unlock().position(midpoint).lock();
                    } else {
                        errors.error({
                            status: 'logError',
                            message: `the midpoint of the edge ${edge.id()} is not defined`,
                        });
                    }
                });
        });
        cy.on('remove', 'edge', (e) => {
            this.getEdgeNode(cy, e.target)?.remove();
        });
    }

    /**
     * Draws the tables to the graph (all tables with set postions are locked)
     * @param cy
     * @param tables the tables that should be displayed on the graph (including intermediateTables)
     * @param indicatePositionStatuses wether tables whose position has been changed or isn't set yet should be highlighted
     * @param selectableIntermediateTables wether intermediateTables should be selectable or not
     * if not supplied they will be treated as any other table
     */
    public drawTables(
        cy: cytoscape.Core,
        tables: ReadonlyArray<Table>,
        indicatePositionStatuses: boolean,
        selectableIntermediateTables: boolean
    ) {
        // Reset graph
        cy.remove('edge');
        cy.remove('node');
        const addedTables: UUID[] = [];

        let i = 0;
        // Create all table-nodes
        // Source- and target-nodes have to be registered before adding an aux-node
        while (addedTables.length < tables.length) {
            for (const table of tables) {
                if (addedTables.includes(table.id)) {
                    continue;
                }
                if (table.type === 'default') {
                    const displayNames = this.i18nService.getLanguage(
                        table.displayNames
                    );
                    const displayName =
                        (displayNames &&
                            this.domSanitizer.sanitize(
                                1,
                                displayNames.singular
                            )) ||
                        '???';
                    let classes = 'table';
                    const position =
                        table.coordinates.x !== null &&
                        table.coordinates.y !== null
                            ? {
                                  x: table.coordinates.x,
                                  y: table.coordinates.y,
                              }
                            : undefined;
                    if (!position && indicatePositionStatuses) {
                        classes += ' positionUnset';
                    }
                    const tableNode = cy.add({
                        data: {
                            id: table.id,
                            displayName,
                        },
                        classes,
                        position,
                    });
                    tableNode.style({
                        width: `${CytoscapeUtilities.calculateNodeWidth(
                            cy,
                            displayName,
                            fontSize
                        )}px`,
                    });
                    tableNode.on('position', (e) => {
                        const newPosition = tableNode.position();
                        if (
                            indicatePositionStatuses &&
                            // position has changed
                            table.coordinates.x !== null &&
                            table.coordinates.y !== null &&
                            newPosition &&
                            (table.coordinates.x !== newPosition.x ||
                                table.coordinates.y !== newPosition.y)
                        ) {
                            tableNode.addClass('positionChanged');
                        } else {
                            tableNode.removeClass('positionChanged');
                        }
                    });
                    if (
                        table.coordinates.x !== null &&
                        table.coordinates.y !== null
                    ) {
                        tableNode.lock();
                    }
                    addedTables.push(table.id);
                } else if (
                    table.type === 'intermediate' &&
                    addedTables.includes(
                        table.intermediateTableInformation.first.tableId
                    ) &&
                    addedTables.includes(
                        table.intermediateTableInformation.second.tableId
                    )
                ) {
                    // Intermediate table
                    // Get displayName from first foreign-attribute
                    const firstTable = tables.find(
                        (tableX) =>
                            tableX.id ===
                            table.intermediateTableInformation.first.tableId
                    );
                    let displayName;
                    if (firstTable) {
                        const attrId =
                            table.intermediateTableInformation.first
                                .attributeId;
                        const firstAttribute = firstTable.attributes.find(
                            (attrX) => attrX.id === attrId
                        );
                        if (firstAttribute) {
                            displayName = this.i18nService.getLanguage(
                                firstAttribute.displayNames
                            );
                        } else {
                            errors.error({
                                message: `Foreign Attribute ${attrId} of ${firstTable.id} not found`,
                            });
                        }
                    } else {
                        errors.error({
                            message: `First Table ${table.intermediateTableInformation.first.tableId} not found`,
                        });
                    }
                    let source: cytoscape.NodeSingular;
                    let target: cytoscape.NodeSingular;
                    // eslint-disable-next-line unicorn/prefer-query-selector
                    const sourceElement = cy.getElementById(
                        table.intermediateTableInformation.first.tableId
                    );
                    // eslint-disable-next-line unicorn/prefer-query-selector
                    const targetElement = cy.getElementById(
                        table.intermediateTableInformation.second.tableId
                    );
                    if (sourceElement.isEdge()) {
                        source = this.addEdgeNode(cy, sourceElement)!;
                    } else {
                        source = sourceElement;
                    }
                    if (targetElement.isEdge()) {
                        target = this.addEdgeNode(cy, targetElement)!;
                    } else {
                        target = targetElement;
                    }
                    cy.add({
                        data: {
                            id: table.id,
                            source: source.id(),
                            target: target.id(),
                            foreignRelationshipMax:
                                table.intermediateTableInformation.second
                                    .relationshipMax,
                            relationshipMax:
                                table.intermediateTableInformation.first
                                    .relationshipMax,
                            displayName:
                                (displayName &&
                                    this.domSanitizer.sanitize(
                                        1,
                                        displayName.singular
                                    )) ||
                                '???',
                        },
                    });
                    if (!selectableIntermediateTables) {
                        // eslint-disable-next-line unicorn/prefer-query-selector
                        cy.getElementById(table.id).unselectify();
                    }
                    addedTables.push(table.id);
                }
            }
            i++;
            if (i > 26) {
                const remainingTables = [];
                for (const table of tables) {
                    if (!addedTables.includes(table.id)) {
                        remainingTables.push(table);
                    }
                }
                errors.error({
                    message:
                        'Graph needed to many iterations to be drawn. Not every relation is displayed correctly. This could be due to corrupted tables. These tables were remaining: ',
                    logValues: { remainingTables },
                });
                break;
            }
        }
    }

    /**
     * automatically positions the tables in the graph
     * @param cy the cytoscape object
     * @returns a reference of the layout
     */
    public runLayout(cy: cytoscape.Core) {
        const layouts = cy
            .elements()
            .createLayout(
                this.layoutOptions((event) => {
                    // Fit nodes into grid
                    cy.nodes('*').forEach((node) => {
                        if (this.isEdgeNode(node)) {
                            return;
                        }
                        node.position({
                            x: this.calculateGridPosition(node.position().x),
                            y: this.calculateGridPosition(node.position().y),
                        }).unlock();
                    });
                    CytoscapeUtilities.fit(cy, this.fitPadding);
                })
            )
            .run();
        return layouts;
    }

    private calculateGridPosition(pos: number) {
        return (
            (Math.floor(pos / this.gridGuideOptions.gridSpacing) + 0.5) *
            this.gridGuideOptions.gridSpacing
        );
    }

    /**
     * inspired by cytoscapeEdgeConnections
     * adds a node to the middle of the edge to enable edges to connect to edges
     * the id of this edgeNode is: edge.id + this.edgeNodePostfix
     * it also has the class "edgeNode"
     */
    private addEdgeNode(cy: cytoscape.Core, edge: cytoscape.EdgeSingular) {
        const alreadyExistingEdgeNode = this.getEdgeNode(cy, edge);
        if (this.getEdgeNode(cy, edge)) {
            return alreadyExistingEdgeNode;
        }
        return cy
            .add({
                data: {
                    id: edge.id() + this.edgeNodePostfix,
                },
                classes: 'edgeNode',
                position: this.getEdgeMidpoint(edge),
            })
            .lock()
            .unselectify();
    }

    /**
     * @param cy
     * @param edge
     * @returns the edgeNode belonging to the edge, if there is none it returns undefined
     */
    private getEdgeNode(cy: cytoscape.Core, edge: cytoscape.EdgeSingular) {
        // eslint-disable-next-line unicorn/prefer-query-selector
        const edgeNode = cy.getElementById(edge.id() + this.edgeNodePostfix);
        if (edgeNode.size() <= 0) {
            return undefined;
        }
        errors.assert(edgeNode.size() <= 1, {
            status: 'error',
            message: `There are multiple edgeNodes for edge ${edge.id()}`,
        });
        return edgeNode;
    }

    private isEdgeNode(node: cytoscape.NodeSingular) {
        return node.hasClass('edgeNode');
    }

    /**
     * @param edge
     * @returns the midpoint of an edge (or undefined if it can't be calculated)
     */
    private getEdgeMidpoint(edge: cytoscape.EdgeSingular) {
        const midpoint = edge.midpoint();
        // this seems to happen, if a node is moved very fast
        if (Number.isNaN(midpoint.x) || Number.isNaN(midpoint.y)) {
            return undefined;
        }
        return midpoint;
    }
}

const fontSize = '2em';
