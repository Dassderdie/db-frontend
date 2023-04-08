import type { UUID } from '@cache-server/api/uuid';

/**
 * @param url the url in which should be searched for the id
 * @param start a string (no regex) for the part before the id
 * @param end a string (no regex) for the part after the id
 */
export function getUUIDFromUrl(
    url: string,
    start: string,
    end: string
): UUID | undefined {
    return RegExp(
        `${start}[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}${end}`,
        'u'
    )
        .exec(url)?.[0]!
        .slice(start.length, -end.length);
}
