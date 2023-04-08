import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import type { Version } from '@cache-server/api/versions/version';

/**
 * @param ownAttributeId attributeId in the intermediateTable that points to the table of version
 * @param version version from which you want to get all foreign entries
 * @returns a filter that returns all intermediateEntries that where created and not invalidated on a specific version
 */
export function presentForeignRelationsFilter(
    ownAttributeId: UUID,
    version: Version
): FilterGroup {
    let innerFilter: FilterGroup | undefined;
    if (version.updateId) {
        innerFilter = {
            type: 'or',
            expressions: [
                {
                    key: 'updateId',
                    type: 'equal',
                    value: version.updateId,
                },
                {
                    type: 'and',
                    expressions: [
                        {
                            key: 'createdAt',
                            type: 'less',
                            value: version.createdAt,
                        },
                        {
                            type: 'or',
                            expressions: [
                                {
                                    key: 'invalidatedAt',
                                    type: 'equal',
                                    value: null,
                                },
                                {
                                    type: 'and',
                                    expressions: [
                                        {
                                            key: 'invalidatedAt',
                                            type: 'greater',
                                            value: version.createdAt,
                                        },
                                        {
                                            key: 'invalidationUpdateId',
                                            type: 'notEqual',
                                            value: version.updateId,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    } else {
        innerFilter = {
            type: 'and',
            expressions: [
                {
                    key: 'createdAt',
                    type: 'less',
                    value: version.createdAt,
                },
                {
                    type: 'or',
                    expressions: [
                        {
                            key: 'invalidatedAt',
                            type: 'equal',
                            value: null,
                        },
                        {
                            key: 'invalidatedAt',
                            type: 'greater',
                            value: version.createdAt,
                        },
                    ],
                },
            ],
        };
    }
    return {
        type: 'and',
        expressions: [
            {
                key: ownAttributeId,
                type: 'equal',
                value: version.entryId,
            },
            {
                key: 'deleted',
                type: 'equal',
                value: false,
            },
            innerFilter,
        ],
    };
}
