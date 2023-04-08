import type { JsonObject } from './json-object';

// TODO: See https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts
/**
 * Optional
 * @desc From `T` make a set of properties by key `K` become optional
 * @example
 *    type Props = {
 *      name: string;
 *      age: number;
 *      visible: boolean;
 *    };
 *
 *    // Expect: { name?: string; age?: number; visible?: boolean; }
 *    type Props = Optional<Props>;
 *
 *    // Expect: { name: string; age?: number; visible?: boolean; }
 *    type Props = Optional<Props, 'age' | 'visible'>;
 */
export type Optional<T extends JsonObject, K extends keyof T = keyof T> = Omit<
    T,
    K
> &
    Partial<Pick<T, K>>;
