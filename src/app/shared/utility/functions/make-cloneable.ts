/**
 * Converts a value so that it can be cloned by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
 * (Native errors are currently not preserved, because Firefox doesn't support it yet)
 */
export function makeCloneable(value: any) {
    if (typeof value === 'object') {
        return JSON.parse(
            JSON.stringify(value, (k, v) => (k === '$meta' ? undefined : v))
        );
    }
    if (typeof value === 'function') {
        return undefined;
    }
    return value;
}
