export function hexToRgb(hex: string) {
    // https://stackoverflow.com/a/5624139
    const result =
        /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/iu
            .exec(hex)
            ?.map((hexValue) => Number.parseInt(hexValue, 16)) ?? [];
    // results[0] is NaN
    return `rgb(${result[1] ?? 0}, ${result[2] ?? 0}, ${result[3] ?? 0})`;
}
