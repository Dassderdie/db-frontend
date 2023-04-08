import type { Version } from '@cache-server/api/versions/version';
import { getNewestVersionFilter } from '@shared/utility/functions/get-newest-version-filter-group';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { UUID } from '../uuid';

export class VersionsApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    public async updateVersions(options: {
        projectId?: UUID;
        tableId?: UUID;
    }): Promise<Version[]> {
        return this.subscriptionHandler.renewItems({
            type: 'versions',
            action: {
                kind: 'getVersions',
                options,
            },
        });
    }

    /**
     * Gets the 'limit' versions after 'showAfterVersion' when sorted after 'sortingKey'
     * with the specified 'sortingOrder' that match the provided filter in the table with projectId and tableId
     */
    public async getVersions(options: {
        projectId: UUID;
        tableId: UUID;
        filter?: string;
        showAfterVersion?: UUID;
        sortingKey?: UUID | string;
        sortingOrder?: 'ascending' | 'descending';
        limit: number;
    }): Promise<{ versions: Version[]; totalVersionCount: number }> {
        return this.authHttp
            .get<{
                versions: Version[];
                totalVersionCount: number;
            }>('/versions', options)
            .then((response) => {
                const results = response.data;
                // Cache each newestVersion
                for (const version of results.versions) {
                    if (version.invalidatedAt) {
                        continue;
                    }
                    this.subscriptionHandler.cache(
                        {
                            type: 'versions',
                            action: {
                                kind: 'getNewestVersion',
                                options: {
                                    projectId: version.projectId,
                                    tableId: version.tableId,
                                    entryId: version.id,
                                },
                            },
                        },
                        version
                    );
                }
                return results;
            });
    }

    /**
     * Because the newestVersion is not affected from new/updated entries like an ordinary search it has its own key in the cache
     */

    /**
     * Gets the 'limit' versions after 'showAfterVersion' when sorted after 'sortingKey'
     * with the specified 'sortingOrder' that match the provided filter in the table with projectId and tableId
     */
    public async getNewestVersion(options: {
        projectId: UUID;
        tableId: UUID;
        entryId: UUID;
    }): Promise<Version | undefined> {
        return this.authHttp
            .get<{
                versions: Version[];
                totalVersionCount: number;
            }>('/versions', {
                projectId: options.projectId,
                tableId: options.tableId,
                filter: JSON.stringify(getNewestVersionFilter(options.entryId)),
            })
            .then((response) => {
                if (
                    response.data.totalVersionCount > 1 ||
                    response.data.versions.length > 1
                ) {
                    errors.error({
                        message:
                            'there are multiple not invalidated entries for ',
                        logValues: { options, data: response.data },
                    });
                }
                return response.data.versions[0];
            });
    }
}
