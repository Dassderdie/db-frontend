export interface GridGuideCytoscape extends cytoscape.Core {
    gridGuide: any;
}

export interface GridGuideOptions {
    // On/Off Modules
    /* From the following four snap options, at most one should be true at a given time */
    snapToGridOnRelease?: boolean; // Snap to grid on release
    snapToGridDuringDrag?: boolean; // Snap to grid during drag
    snapToAlignmentLocationOnRelease?: boolean; // Snap to alignment location on release
    snapToAlignmentLocationDuringDrag?: boolean; // Snap to alignment location during drag
    distributionGuidelines?: boolean; // Distribution guidelines
    geometricGuideline?: boolean; // Geometric guidelines
    initPosAlignment?: boolean; // Guideline to initial mouse position
    centerToEdgeAlignment?: boolean; // Center to edge alignment
    resize?: boolean; // Adjust node sizes to cell sizes
    parentPadding?: boolean; // Adjust parent sizes to cell sizes by padding
    drawGrid?: boolean; // Draw grid background

    // General
    gridSpacing: number; // Distance between the lines of the grid.

    // Draw Grid
    zoomDash?: boolean; // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
    panGrid?: boolean; // Determines whether the grid should move then the user moves the graph if grid is drawn.
    gridStackOrder?: number; // Namely z-index
    gridColor?: string; // Color of grid lines
    lineWidth?: number; // Width of grid lines

    // Guidelines
    guidelinesStackOrder?: number; // Z-index of guidelines
    guidelinesTolerance?: number; // Tolerance distance for rendered positions of nodes' interaction.
    guidelinesStyle?: {
        // Set ctx properties of line. Properties are here:
        strokeStyle?: string; // Color of geometric guidelines
        geometricGuidelineRange?: number; // Range of geometric guidelines
        range?: number; // Max range of distribution guidelines
        minDistRange?: number; // Min range for distribution guidelines
        distGuidelineOffset?: number; // Shift amount of distribution guidelines
        horizontalDistColor?: string; // Color of horizontal distribution alignment
        verticalDistColor?: string; // Color of vertical distribution alignment
        initPosAlignmentColor?: string; // Color of alignment to initial mouse location
        lineDash?: [number, number]; // Line style of geometric guidelines
        horizontalDistLine?: [number, number]; // Line style of horizontal distribution guidelines
        verticalDistLine?: [number, number]; // Line style of vertical distribution guidelines
        initPosAlignmentLine?: [number, number]; // Line style of alignment to initial mouse position
    };

    // Parent Padding
    parentSpacing?: number; // -1 to set paddings of parents to gridSpacing
}
