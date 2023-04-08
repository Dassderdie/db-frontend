import { calculateTextWidth } from './functions/calculate-text-width';

export class CytoscapeUtilities {
    static fit(cy: cytoscape.Core, fitPadding: number) {
        cy.resize();
        cy.fit(undefined, fitPadding);
    }

    static resizeCy(
        event: DragEvent,
        cyContainer: HTMLElement,
        cy: cytoscape.Core,
        minHeight: number
    ) {
        const newHeight =
            event.clientY - cyContainer.getBoundingClientRect().top;
        if (
            event.clientY !== 0 &&
            `${newHeight}px` !== cyContainer.style.height &&
            (newHeight > minHeight ||
                cyContainer.style.height !== `${minHeight}px`)
        ) {
            cyContainer.style.height = `${Math.max(newHeight, minHeight)}px`;
            cy.resize();
        }
    }

    static zoomIn(cy: cytoscape.Core, zoomFactor: number) {
        cy.zoom({
            level: cy.zoom() + zoomFactor,
            renderedPosition: getRenderedCenterPosition(cy),
        });
    }

    static zoomOut(cy: cytoscape.Core, zoomFactor: number) {
        cy.zoom({
            level: cy.zoom() - zoomFactor,
            renderedPosition: getRenderedCenterPosition(cy),
        });
    }

    /**
     * Cytoscape doesn't have the option to make the width of a node to be automatically determined by its label
     * -> this tries to estimate this width
     */
    static calculateNodeWidth(
        cy: cytoscape.Core,
        label: string,
        fontSize: string
    ) {
        return calculateTextWidth(
            label,
            // -> bolder is responsible for the default width to reduce complexity
            `bolder ${fontSize} ${window
                .getComputedStyle(document.body, null)
                .getPropertyValue('font-family')}`,
            getNodeCanvasFromCy(cy)
        );
    }
}

function getRenderedCenterPosition(cy: cytoscape.Core): {
    x: number;
    y: number;
} {
    const container = cy.container();
    return {
        x: (container?.clientWidth ?? 0) / 2,
        y: (container?.clientHeight ?? 0) / 2,
    };
}

function getNodeCanvasFromCy(cy: cytoscape.Core): HTMLCanvasElement {
    return cy.container()!.firstChild!.lastChild as HTMLCanvasElement;
}
