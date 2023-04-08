import { Injectable } from '@angular/core';
import type { NewProject } from '@cache-server/api/projects/project';
import type { UUID } from '@cache-server/api/uuid';
import { CacheClientService } from '../../cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectsService {
    constructor(private readonly cacheClientService: CacheClientService) {}

    /**
     * Lists all projects the currently authenticated user has access to
     */
    public getProjects() {
        return this.cacheClientService.handleSubscribeAction({
            type: 'projects',
            action: {
                kind: 'getProjects',
            },
        });
    }

    /**
     * Gets information about a single project
     * @param projectId Id of the project
     */
    public getProject(projectId: UUID) {
        return this.cacheClientService.handleSubscribeAction({
            type: 'projects',
            action: {
                kind: 'getProject',
                options: {
                    projectId,
                },
            },
        });
    }

    /**
     * Creates a new project using name and description
     * @param newProject Project data
     */
    public async createProject(newProject: NewProject) {
        return this.cacheClientService.handleAction({
            type: 'projects',
            action: {
                kind: 'createProject',
                options: {
                    newProject,
                },
            },
        });
    }

    /**
     * Changes the name and description of the project
     * @param projectId
     * @param name
     * @param description
     * @param allowAnonymousVersionCreation
     */
    public async editProject(
        projectId: UUID,
        name: string,
        description: string | null,
        allowAnonymousVersionCreation: boolean
    ) {
        return this.cacheClientService.handleAction({
            type: 'projects',
            action: {
                kind: 'editProject',
                options: {
                    projectId,
                    name,
                    description,
                    allowAnonymousVersionCreation,
                },
            },
        });
    }

    /**
     * delete the project specified by the projectId
     * @param projectId
     */
    public async deleteProject(projectId: UUID) {
        return this.cacheClientService.handleAction({
            type: 'projects',
            action: {
                kind: 'deleteProject',
                options: {
                    projectId,
                },
            },
        });
    }
}
