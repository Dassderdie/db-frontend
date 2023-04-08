/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param text The text to be rendered.
 * @param font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 * @returns the width in px
 */
export function calculateTextWidth(
    text: string,
    font: string,
    customCanvas?: HTMLCanvasElement
) {
    let canvas = customCanvas;
    if (!canvas) {
        // re-use canvas object for better performance
        canvas = document.querySelector<HTMLCanvasElement>(`#${uniqueId}`)!;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.setAttribute('id', uniqueId);
        }
    }
    const context = canvas.getContext('2d')!;
    context.font = font;
    const textMetrics = context.measureText(text);
    return (
        Math.abs(textMetrics.actualBoundingBoxLeft) +
        Math.abs(textMetrics.actualBoundingBoxRight)
    );
}

const uniqueId = 'textWidthCalculatorCanvas';
