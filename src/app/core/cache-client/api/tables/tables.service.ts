import { Injectable } from '@angular/core';
import type {
    EditTable,
    NewTable,
    Table,
} from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Observable } from 'rxjs';
import { CacheClientService } from '../../cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class TablesService {
    constructor(private readonly cacheClientService: CacheClientService) {}

    /**
     * List the tables of the project the currently authenticated user has access to
     * @param projectId Id of the project
     */
    public getTables(projectId: UUID) {
        return this.cacheClientService.handleSubscribeAction({
            type: 'tables',
            action: {
                kind: 'getTables',
                options: {
                    projectId,
                },
            },
        });
    }

    /**
     * Gets information about a single table
     * (the generic is there to simplify typeassertion, because often not all kind of tables are expected)
     * @param projectId Id of the project
     * @param id Id of the table in the project
     */
    public getTable<T extends Table = Table>(
        projectId: UUID,
        id: UUID
    ): Observable<T> {
        return this.cacheClientService.handleSubscribeAction({
            type: 'tables',
            action: {
                kind: 'getTable',
                options: {
                    projectId,
                    tableId: id,
                },
            },
        }) as Observable<T>;
    }

    /**
     * Retrieves the most recent tables directly from the server
     */
    public async getCurrentTables(projectId: UUID) {
        return this.cacheClientService.handleAction({
            type: 'tables',
            action: {
                kind: 'getTables',
                options: {
                    projectId,
                },
            },
        });
    }

    public async updateTables(projectId: UUID) {
        return this.cacheClientService.handleAction({
            type: 'tables',
            action: {
                kind: 'updateTables',
                options: {
                    projectId,
                },
            },
        });
    }

    /**
     * Creates a new table in the project
     * @param table
     * @param update Wether the tables should be refetched from the server after this table has been updated
     */
    public async createTable(table: NewTable, update = true) {
        return this.cacheClientService.handleAction({
            type: 'tables',
            action: {
                kind: 'createTable',
                options: {
                    table,
                    update,
                },
            },
        });
    }

    /**
     * Edits a table in the project
     * !there mustn't be any new attributes!
     * @param table
     * @param update Wether the tables should be refetched from the server after this table has been updated
     */
    public async editTable(table: EditTable, update = true) {
        return this.cacheClientService.handleAction({
            type: 'tables',
            action: {
                kind: 'editTable',
                options: {
                    table,
                    update,
                },
            },
        });
    }

    public async deleteTable(projectId: UUID, tableId: UUID) {
        return this.cacheClientService.handleAction({
            type: 'tables',
            action: {
                kind: 'deleteTable',
                options: {
                    projectId,
                    tableId,
                },
            },
        });
    }
}
