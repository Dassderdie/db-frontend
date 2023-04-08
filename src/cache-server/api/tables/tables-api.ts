import type {
    DefaultTable,
    EditTable,
    NewTable,
    Table,
} from '@cache-server/api/tables/table';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { UUID } from '../uuid';

export class TablesApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    /**
     * List the tables the currently authenticated user has access to
     */
    public async getTables(options: {
        projectId: UUID;
    }): Promise<ReadonlyArray<Table>> {
        return this.authHttp
            .get<{
                tables: ReadonlyArray<Table>;
            }>('/tables', options)
            .then((response) => {
                const tables = response.data.tables;
                // renew the value of every table
                for (const table of tables) {
                    this.subscriptionHandler.cache(
                        {
                            type: 'tables',
                            action: {
                                kind: 'getTable',
                                options: {
                                    projectId: table.projectId,
                                    tableId: table.id,
                                },
                            },
                        },
                        table
                    );
                }
                return tables;
            });
    }

    /**
     * Gets information about a single table
     */
    public async getTable(options: {
        projectId: UUID;
        /**
         * Id of the table
         */
        tableId: UUID;
    }): Promise<Table> {
        return this.authHttp
            .get<{
                tables: Table[];
            }>('/tables', {
                projectId: options.projectId,
                tableId: options.tableId,
            })
            .then((response) => response.data.tables[0]!);
    }

    public async editTable(options: {
        table: EditTable;
        /**
         * Wether the tables should be refetched from the server after this table has been updated
         */
        update: boolean;
    }): Promise<DefaultTable> {
        const set = this.authHttp
            .put<{
                table: DefaultTable;
            }>('/tables', options.table)
            .then((response) => response.data.table);
        if (options.update) {
            set.then((createdTable) => {
                // set the createdTable in the cache
                this.subscriptionHandler.cache(
                    {
                        type: 'tables',
                        action: {
                            kind: 'getTable',
                            options: {
                                projectId: createdTable.projectId,
                                tableId: createdTable.id,
                            },
                        },
                    },
                    createdTable,
                    true
                );
            }).finally(async () =>
                // renew all tables
                this.updateTables({ projectId: options.table.projectId })
            );
        }
        return set;
    }

    public async createTable(options: {
        table: NewTable;
        /**
         * Wether the tables should be refetched from the server after this table has been updated
         */
        update: boolean;
    }): Promise<DefaultTable> {
        const set = this.authHttp
            .post<{
                table: DefaultTable;
            }>('/tables', options.table)
            .then((response) => response.data.table);
        if (options.update) {
            set.then((createdTable) => {
                // set the createdTable in the cache
                this.subscriptionHandler.cache(
                    {
                        type: 'tables',
                        action: {
                            kind: 'getTable',
                            options: {
                                projectId: createdTable.projectId,
                                tableId: createdTable.id,
                            },
                        },
                    },
                    createdTable,
                    true
                );
            }).finally(async () =>
                // renew all tables
                this.updateTables({ projectId: options.table.projectId })
            );
        }
        return set;
    }

    /**
     * Renews all tables in the specified project that are currently cached
     */
    public async updateTables(options: { projectId: UUID }): Promise<unknown> {
        return Promise.all([
            this.subscriptionHandler.renewItems({
                type: 'tables',
                action: {
                    kind: 'getTables',
                    options: {
                        projectId: options.projectId,
                    },
                },
            }),
            this.subscriptionHandler.renewItems({
                type: 'tables',
                action: {
                    kind: 'getTable',
                    options: {
                        projectId: options.projectId,
                    },
                },
            }),
        ]);
    }

    /**
     * Delete the table specified by the tableId
     */
    public async deleteTable(options: {
        projectId: UUID;
        /**
         * Id of the table
         */
        tableId: UUID;
    }): Promise<null> {
        return this.authHttp
            .delete<null>('/tables', {
                projectId: options.projectId,
                tableId: options.tableId,
            })
            .then((response) => response.data)
            .finally(() => {
                // renew all tables
                this.subscriptionHandler.renewItems({
                    type: 'tables',
                    action: {
                        kind: 'getTables',
                        options: {
                            projectId: options.projectId,
                        },
                    },
                });
            });
    }
}
