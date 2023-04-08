import { Injectable } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import type { Observable } from 'rxjs';
import { CacheClientService } from '../../cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class VersionsService {
    /**
     * default limit for getVersions
     */
    public readonly defaultLimit = 25;

    constructor(private readonly cacheClientService: CacheClientService) {}

    /**
     * Gets versions in a table
     * @param projectId Id of the project
     * @param tableId Id of the table in the project
     * @param limit the number of relations that should be loaded
     * - if you use the defaultLimit it can be more likely that the response is already cached from another request
     */
    public getVersions(
        projectId: UUID,
        tableId: UUID,
        filter: string | null,
        showAfterVersion?: UUID,
        sortingKey?: UUID | string,
        sortingOrder?: 'ascending' | 'descending',
        limit = this.defaultLimit
    ) {
        return this.cacheClientService.handleSubscribeAction({
            type: 'versions',
            action: {
                kind: 'getVersions',
                options: {
                    projectId,
                    tableId,
                    filter: filter ?? undefined,
                    showAfterVersion,
                    sortingKey,
                    sortingOrder,
                    limit,
                },
            },
        });
    }

    /**
     * Gets the newest version of the entry
     * @param projectId Id of the project
     * @param tableId Id of the table in the project
     * @param entryId Id of the entry in the table in the project
     */
    public getNewestVersion(
        projectId: UUID,
        tableId: UUID,
        entryId: UUID
    ): Observable<Version | undefined> {
        return this.cacheClientService.handleSubscribeAction({
            type: 'versions',
            action: {
                kind: 'getNewestVersion',
                options: {
                    projectId,
                    tableId,
                    entryId,
                },
            },
        });
    }
}
