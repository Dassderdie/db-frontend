import type { JsonObject } from '@shared/utility/types/json-object';
import { isEmpty, pickBy } from 'lodash-es';

/**
 * @returns the complete url with the params added
 */
export function getFullUrl(baseUrl: string, params?: JsonObject) {
    // remove all undefined properties (null would be the way to go instead)
    const cleanedParams = pickBy(params, (v) => v !== undefined);
    return !cleanedParams || isEmpty(cleanedParams)
        ? baseUrl
        : `${baseUrl}?${new URLSearchParams(cleanedParams as any).toString()}`;
}
