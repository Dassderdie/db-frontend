import type { JsonObject } from './json-object';

/**
 * Overwrites the first Object with the values of the second one
 * See https://stackoverflow.com/a/55032655
 */
export type Overwrite<O1 extends JsonObject, O2 extends JsonObject> = O2 &
    Omit<O1, keyof O2>;
