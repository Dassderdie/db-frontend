/**
 * Can be used to wait for the specified amount of time
 */
export async function wait(numberInMs: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, numberInMs);
    });
}
