import type { JsonObject } from './json-object';

// See https://stackoverflow.com/a/58436959
type Cons<H, T> = T extends readonly unknown[]
    ? ((h: H, ...t: T) => void) extends (...r: infer R) => void
        ? R
        : never
    : never;

type Prev = [
    never,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    ...0[]
];

export type Paths<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends JsonObject
    ? {
          [K in keyof T]-?:
              | (Paths<T[K], Prev[D]> extends infer P
                    ? P extends []
                        ? never
                        : Cons<K, P>
                    : never)
              | [K];
      }[keyof T]
    : [];
