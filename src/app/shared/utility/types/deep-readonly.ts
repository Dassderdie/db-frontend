import type { Builtin } from './primitive';
// From https://github.com/krzkaczor/ts-essentials

/** Like Readonly but recursive */
export type DeepReadonly<T> = T extends Builtin
    ? T
    : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlyMap<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends WeakMap<infer K, infer V>
    ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends Set<infer U>
    ? ReadonlySet<DeepReadonly<U>>
    : T extends ReadonlySet<infer U>
    ? ReadonlySet<DeepReadonly<U>>
    : T extends WeakSet<infer U>
    ? WeakSet<DeepReadonly<U>>
    : T extends Promise<infer U>
    ? Promise<DeepReadonly<U>>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {}
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : Readonly<T>;
