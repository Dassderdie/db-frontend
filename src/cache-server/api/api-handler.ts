import type { HttpProgressHandler } from '@cache-server/http-handler/http-progress-handler';
import type { CustomHttpHandler } from '../http-handler/custom-http-handler';
import type { CustomStorage } from '../storage/custom-storage';
import type { SubscriptionsHandler } from '../subscriptions-handler/subscriptions-handler';
import type { ApiConversation } from './api-conversation';
import { AuthHttpHandler } from './auth-http-handler';
import { AuthApi } from './auth/auth-api';
import { BlobsApi } from './blobs/blobs-api';
import { EditEntriesApi } from './edit-entries/edit-entries-api';
import { ProjectsApi } from './projects/projects-api';
import { RolesApi } from './roles/roles-api';
import { TablesApi } from './tables/tables-api';
import { UsersApi } from './users/users-api';
import { VersionsApi } from './versions/versions-api';

export class ApiHandler {
    public readonly auth!: AuthApi;
    public readonly users!: UsersApi;
    private readonly projects!: ProjectsApi;
    private readonly tables!: TablesApi;
    private readonly versions!: VersionsApi;
    private readonly roles!: RolesApi;
    private readonly editEntries!: EditEntriesApi;
    private readonly authHttp!: AuthHttpHandler;
    private readonly blobs!: BlobsApi;

    constructor(
        http: CustomHttpHandler,
        httpProgress: HttpProgressHandler,
        subscriptionsHandler: SubscriptionsHandler,
        storage: CustomStorage,
        projects?: ProjectsApi,
        auth?: AuthApi,
        users?: UsersApi,
        tables?: TablesApi,
        versions?: VersionsApi,
        roles?: RolesApi,
        editEntries?: EditEntriesApi,
        blobs?: BlobsApi
    ) {
        this.auth = auth ?? new AuthApi(http, storage, subscriptionsHandler);
        this.authHttp = new AuthHttpHandler(http, httpProgress, this.auth);
        this.projects =
            projects ?? new ProjectsApi(this.authHttp, subscriptionsHandler);
        this.users = users ?? new UsersApi(this.authHttp, subscriptionsHandler);
        this.tables =
            tables ?? new TablesApi(this.authHttp, subscriptionsHandler);
        this.versions =
            versions ?? new VersionsApi(this.authHttp, subscriptionsHandler);
        this.roles = roles ?? new RolesApi(this.authHttp, subscriptionsHandler);
        this.editEntries =
            editEntries ??
            new EditEntriesApi(this.authHttp, subscriptionsHandler);
        this.blobs = blobs ?? new BlobsApi(this.authHttp, this.auth);
    }

    public async handleActions<Conversation extends ApiConversation['all']>(
        // intersection type to narrow type correctly
        message: Conversation['message']
    ): Promise<Conversation['response']['data']> {
        switch (message.type) {
            case 'auth':
                return this.auth.handleAction(message.action);
            case 'tables':
                return this.tables.handleAction(message.action);
            case 'projects':
                return this.projects.handleAction(message.action);
            case 'users':
                return this.users.handleAction(message.action);
            case 'versions':
                return this.versions.handleAction(message.action);
            case 'roles':
                return this.roles.handleAction(message.action);
            case 'editEntries':
                return this.editEntries.handleAction(message.action);
            case 'blobs':
                return this.blobs.handleAction(message.action);
            default:
                errors.error({
                    message: `Unknown resources-message`,
                    logValues: { message },
                });
                return Promise.reject(Error(`Unknown resources-message`));
        }
    }
}
