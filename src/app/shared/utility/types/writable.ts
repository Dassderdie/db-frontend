import type { Builtin } from './primitive';

// From https://github.com/krzkaczor/ts-essentials
/** Make readonly object writable */
export type Writable<T> = { -readonly [P in keyof T]: T[P] };

/** Like Writable but recursive */
export type DeepWritable<T> = T extends Builtin
    ? T
    : T extends Map<infer K, infer V>
    ? Map<DeepWritable<K>, DeepWritable<V>>
    : T extends ReadonlyMap<infer K, infer V>
    ? Map<DeepWritable<K>, DeepWritable<V>>
    : T extends WeakMap<infer K, infer V>
    ? WeakMap<DeepWritable<K>, DeepWritable<V>>
    : T extends Set<infer U>
    ? Set<DeepWritable<U>>
    : T extends ReadonlySet<infer U>
    ? Set<DeepWritable<U>>
    : T extends WeakSet<infer U>
    ? WeakSet<DeepWritable<U>>
    : T extends Promise<infer U>
    ? Promise<DeepWritable<U>>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {}
    ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
    : T;
