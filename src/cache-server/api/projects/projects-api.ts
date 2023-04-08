import type { NewProject, Project } from '@cache-server/api/projects/project';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { UUID } from '../uuid';

export class ProjectsApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    /**
     * List the projects the currently authenticated user has access to
     */
    public async getProjects(): Promise<Project[]> {
        return this.authHttp
            .get<{
                projects: Project[];
            }>('/projects', {})
            .then((response) => {
                const projects = response.data.projects;
                // renew the value of every project
                for (const project of projects) {
                    this.subscriptionHandler.cache(
                        {
                            type: 'projects',
                            action: {
                                kind: 'getProject',
                                options: {
                                    projectId: project.id,
                                },
                            },
                        },
                        project
                    );
                }
                return projects;
            });
    }

    /**
     * Gets information about a single project
     */
    public async getProject(options: {
        /**
         * Id of the project
         */
        projectId: UUID;
    }): Promise<Project> {
        return this.authHttp
            .get<{
                projects: Project[];
            }>('/projects', {
                id: options.projectId,
            })
            .then((response) => response.data.projects[0]!);
    }

    /**
     * Creates a new project using name and description
     */
    public async createProject(options: {
        /**
         * The new project
         */
        newProject: NewProject;
    }): Promise<Project> {
        const params = {
            name: options.newProject.name,
        };
        if (options.newProject.description) {
            (params as any).description = options.newProject.description;
        }
        return this.authHttp
            .post<{
                project: Project;
            }>('/projects', params)
            .finally(async () =>
                // renew all projects
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProjects',
                    },
                })
            )
            .then((response) => {
                const createdProject = response.data.project;
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProject',
                        options: {
                            projectId: createdProject.id,
                        },
                    },
                });
                // set the createdProject in the cache
                this.subscriptionHandler.cache(
                    {
                        type: 'projects',
                        action: {
                            kind: 'getProject',
                            options: {
                                projectId: createdProject.id,
                            },
                        },
                    },
                    createdProject,
                    true
                );
                return createdProject;
            });
    }

    /**
     * Changes parameters of the project
     */
    public async editProject(options: {
        projectId: UUID;
        name: string;
        description: string | null;
        allowAnonymousVersionCreation: boolean;
    }): Promise<Project> {
        const params = {
            projectId: options.projectId,
            name: options.name,
            allowAnonymousVersionCreation:
                options.allowAnonymousVersionCreation,
        };
        if (options.description) {
            (params as any).description = options.description;
        }
        return this.authHttp
            .put<{
                project: Project;
            }>('/projects', params)
            .finally(() => {
                // renew all projects
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProjects',
                    },
                });
                // does only get cached after getProjects if getProjects is currently subscribed to
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProject',
                        options: {
                            projectId: options.projectId,
                        },
                    },
                });
            })
            .then((response) => {
                const project = response.data.project;
                // renew the project with the projectId
                this.subscriptionHandler.cache(
                    {
                        type: 'projects',
                        action: {
                            kind: 'getProject',
                            options: {
                                projectId: options.projectId,
                            },
                        },
                    },
                    project,
                    true
                );
                return project;
            });
    }

    /**
     * Delete the project specified by the projectId
     */
    public async deleteProject(options: {
        /**
         * Id of the project
         */
        projectId: UUID;
    }): Promise<null> {
        return this.authHttp
            .delete<null>('/projects', {
                projectId: options.projectId,
            })
            .then((response) => response.data)
            .finally(async () =>
                // renew all projects
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProjects',
                    },
                })
            );
    }
}
