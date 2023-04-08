import { clone } from 'lodash-es';
import type { JsonObject } from '../types/json-object';

/**
 *
 * @param object
 * @param value
 * @param keys
 * @returns a copy of the object, where all properties belonging to the keys have been copied too (to trigger ChangeDetection)
 */
export function setProperty<T, K1 extends keyof T>(
    object: T,
    value: T[K1],
    keys: [K1]
): T;
export function setProperty<T, K1 extends keyof T, K2 extends keyof T[K1]>(
    object: T,
    value: T[K1][K2],
    keys: [K1, K2]
): T;
export function setProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
>(object: T, value: T[K1][K2][K3], keys: [K1, K2, K3]): T;
export function setProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]
>(object: T, value: T[K1][K2][K3][K4], keys: [K1, K2, K3, K4]): T;
export function setProperty(
    object: JsonObject,
    value: unknown,
    keys: [string, ...string[]]
): JsonObject {
    let obj: any = object;
    let parent: any;
    // all but the last key
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!;
        if (parent) {
            parent[key] = clone(parent[key]);
        }
        obj = obj[key];
        parent = obj;
    }
    obj[keys[keys.length - 1]!] = clone(value);
    return clone(object);
}
