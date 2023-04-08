// From https://github.com/krzkaczor/ts-essentials

export type Primitive =
    | bigint
    | boolean
    | number
    | string
    | symbol
    | null
    | undefined;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Builtin = Date | Error | Function | Primitive | RegExp;
