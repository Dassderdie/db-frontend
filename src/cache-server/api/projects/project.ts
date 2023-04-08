import type { Role } from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';

export interface Project {
    readonly name: string;
    readonly description: string | null;
    readonly id: UUID;
    readonly authenticatedUserRole: Omit<Role, 'user'>;
    readonly allowAnonymousVersionCreation: boolean;
}

export class NewProject implements Partial<Project> {
    constructor(
        public readonly name: string,
        public readonly description?: string | null
    ) {}
}
