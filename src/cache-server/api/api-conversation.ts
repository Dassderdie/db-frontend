import type { AuthConversation } from './auth/auth-conversation';
import type { BlobsConversation } from './blobs/blobs-conversation';
import type { EditEntriesConversation } from './edit-entries/edit-entries-conversation';
import type { ProjectsConversation } from './projects/projects-conversation';
import type { RolesConversation } from './roles/roles-conversation';
import type { TablesConversation } from './tables/tables-conversation';
import type { UsersConversation } from './users/users-conversation';
import type { VersionsConversation } from './versions/versions-conversation';

/**
 * All conversations that are exposed to the outside by the api
 */
export type ApiConversation =
    | AuthConversation
    | BlobsConversation
    | EditEntriesConversation
    | ProjectsConversation
    | ProjectsConversation
    | RolesConversation
    | TablesConversation
    | UsersConversation
    | VersionsConversation;
