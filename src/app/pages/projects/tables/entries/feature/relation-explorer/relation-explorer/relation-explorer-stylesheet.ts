import { hexToRgb } from '@shared/utility/functions/hex-to-rgb';
import { colors } from 'src/app/style-variables';

export const relationExplorerStylesheet: cytoscape.Stylesheet[] = [
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
        selector: 'node.entry',
        style: {
            'background-color': colors.white,
            // to see overlapping nodes
            'background-opacity': 0.5,
            'background-image': (element) => {
                const svg = `<svg width="10" height="10" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="${hexToRgb(
                    element.data('tableColor') as string
                )}"/></svg>`;
                return encodeURI(`data:image/svg+xml;utf-8,${svg}`);
            },
            'background-width': '5px',
            'background-height': '100%',
            'background-position-x': 0,
            'border-width': '1px',
            'padding-left': '7px',
            'padding-right': '0px',
            'padding-top': '3px',
            'padding-bottom': '3px',
            'overlay-padding': '1px',
            'border-color': colors.secondary,
            'overlay-color': colors.secondary,
            color: colors.secondary,
        },
    },
    {
        // A foreign-relation
        selector: 'edge',
        style: {
            width: '1px',
            'curve-style': 'bezier',
            'control-point-step-size': 3,
            'control-point-weight': 1,
            'line-color': colors['gray-500'],
            'overlay-color': colors.white,
            'overlay-padding': '0px',
        },
    },
    {
        // A foreign-relation
        selector: 'edge[displayName]',
        style: {
            label: 'data(displayName)',
            'text-rotation': 0,
            'text-outline-color': colors.light,
            'text-outline-width': '1px',
            'font-size': '1em',
            'font-weight': 'lighter',
        },
    },
    {
        selector: 'node[displayName].entry',
        style: {
            label: 'data(displayName)',
            shape: 'round-rectangle',
            'text-halign': 'center',
            'text-valign': 'center',
            'text-wrap': 'ellipsis',
            'text-max-width': '200px',
            'font-size': '1em',
            'font-weight': 'normal',
            height: '1em',
        },
    },
    {
        selector: 'node.entry[?isInitialEntry]',
        style: {
            'font-weight': 'bold',
            'border-style': 'double',
            'border-width': '3px',
        },
    },
    {
        // The currently selected element
        selector: 'node.entry:selected',
        style: {
            'border-opacity': 0.5,
            'border-width': '4px',
            // text decorations (underline) are not supported (See https://github.com/cytoscape/cytoscape.js/issues/1909)
            'font-weight': 'bolder',
        },
    },
    // the tool states
    {
        selector: `node.entry[selectedTool = 'expand'][?hasUnexpandedAttributes]`,
        style: {
            'border-color': colors.primary,
            'overlay-color': colors.primary,
            color: colors.primary,
        },
    },
    {
        selector: `node.entry[selectedTool = 'remove'][!isInitialEntry]`,
        style: {
            'border-color': colors.primary,
            'overlay-color': colors.primary,
            color: colors.primary,
        },
    },
    {
        selector: `node.entry[selectedTool = 'inspect']`,
        style: {
            'border-color': colors.primary,
            'overlay-color': colors.primary,
            color: colors.primary,
        },
    },
];
