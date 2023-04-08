import jsQR from 'jsqr';

console.log('jsqr-worker started');

/**
 * This webworker gets the width, height of the image as well as the imageData itself
 * and returns the QrCode if one has been found
 * See https://github.com/cozmo/jsQR/issues/151#issuecomment-575957101
 */
addEventListener('message', (message: MessageEvent<JsQRMessage>) => {
    const { width, height, data } = message.data;
    // Respond with the result of runnning jsQR on this frame
    (self as any).postMessage(
        jsQR(data, width, height, {
            inversionAttempts: 'dontInvert',
        })
    );
});

export interface JsQRMessage {
    width: number;
    height: number;
    /**
     * The image data
     */
    data: Uint8ClampedArray;
}
