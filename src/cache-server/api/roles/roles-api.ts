import type { PendingRole } from '@cache-server/api/roles/pending-role';
import type { Role } from '@cache-server/api/roles/role';
import type { HttpResponse } from '@cache-server/http-handler/http-response';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { UUID } from '../uuid';

export class RolesApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    /**
     * List the roles in the project
     */
    public async getRoles(options: {
        projectId: UUID;
        revokedRoles: boolean;
        pendingRoles: boolean;
    }): Promise<{
        roles: Role[];
        pendingRoles?: PendingRole[];
    }> {
        return this.authHttp
            .get<{
                roles: Role[];
                pendingRoles?: PendingRole[];
            }>('/roles', options)
            .then((response) => {
                const roles = response.data.roles;
                // renew the value of every role
                for (const role of roles) {
                    this.subscriptionHandler.cache(
                        {
                            type: 'roles',
                            action: {
                                kind: 'getRole',
                                options: {
                                    projectId: role.projectId,
                                    /**
                                     * Id of the role
                                     */
                                    userId: role.userId,
                                },
                            },
                        },
                        role
                    );
                }
                return response.data;
            });
    }

    /**
     * Gets information about a single role
     */
    public async getRole(options: {
        projectId: UUID;
        /**
         * Id of the role
         */
        userId: UUID;
    }): Promise<Role> {
        return this.authHttp
            .get<{
                roles: Role[];
            }>('/roles', options)
            .then((response) => response.data.roles[0]!);
    }

    private renewRole(projectId: UUID) {
        // renew all roles
        this.subscriptionHandler.renewItems({
            type: 'roles',
            action: {
                kind: 'getRoles',
                options: {
                    projectId,
                },
            },
        });
        this.subscriptionHandler.renewItems({
            type: 'roles',
            action: {
                kind: 'getRole',
                options: {
                    projectId,
                },
            },
        });
    }

    private handleRoleResponse(response: HttpResponse<null>) {
        const role = response.data;
        // TODO: Wait for backend#198 to land (role instead of null as response)
        // renew the role with the roleId
        // const role = response.data.role;
        // this.subscriptionHandler.cache(
        //     {
        //         type: 'roles',
        //         action: {
        //             kind: 'getRole',
        //             options: {
        //                 projectId: role.projectId,
        //                 userId: role.userId,
        //             },
        //         },
        //     },
        //     role,
        //     true
        // );
        return role;
    }

    /**
     * Changes parameters of the role
     */
    public async editRole(options: {
        projectId: UUID;
        userId: string;
        inviteUsers: boolean;
        givePermissions: boolean;
        administrator: boolean;
    }): Promise<null> {
        return this.authHttp
            .put<null>('/roles', options)
            .finally(() => this.renewRole(options.projectId))
            .then((response) => this.handleRoleResponse(response));
    }

    public async editFavoriteTables(options: {
        projectId: UUID;
        favoriteTables: Role['preferences']['favoriteTables'];
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles/edit-favorite-tables', options)
            .finally(() => this.renewRole(options.projectId))
            .then((response) => this.handleRoleResponse(response));
    }

    public async editTableViews(options: {
        projectId: UUID;
        tableViews: Role['preferences']['tableViews'];
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles/edit-table-views', options)
            .finally(() => this.renewRole(options.projectId))
            .then((response) => this.handleRoleResponse(response));
    }

    public async editFilters(options: {
        projectId: UUID;
        filters: Role['preferences']['filters'];
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles/edit-filters', options)
            .finally(() => this.renewRole(options.projectId))
            .then((response) => this.handleRoleResponse(response));
    }

    public async editColumnOrders(options: {
        projectId: UUID;
        columnOrders: Role['preferences']['columnOrders'];
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles/edit-column-orders', options)
            .finally(() => this.renewRole(options.projectId))
            .then((response) => this.handleRoleResponse(response));
    }

    /**
     * Invites an user to a project
     */
    public async inviteUser(options: {
        /**
         * Id of the project
         */
        projectId: UUID;
        /**
         * Email of user to invite
         */
        email: string;
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles/invite-user', options)
            .then((response) => response.data)
            .finally(async () =>
                this.subscriptionHandler.renewItems({
                    type: 'roles',
                    action: {
                        kind: 'getRoles',
                        options: {
                            projectId: options.projectId,
                        },
                    },
                })
            );
    }

    /**
     * Accepts a invitation using a invitation token.
     * This token can be obtained from a invitation email and contains all the necessary information about the invitation.
     */
    public async acceptInvitation(options: {
        invitationToken: string;
    }): Promise<null> {
        return this.authHttp
            .post<null>('/roles', options)
            .then((response) => response.data)
            .finally(() => {
                // renew the projects, because you are now in a new one
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProjects',
                    },
                });
            });
    }

    /**
     * Removes the specified user from the project
     */
    public async removeUser(
        options: {
            projectId: UUID;
        } & (
            | {
                  userId: UUID;
              }
            | { email: string }
        )
    ): Promise<null> {
        return this.authHttp
            .delete<null>('/roles', options)
            .then((response) => response.data)
            .finally(async () =>
                this.subscriptionHandler.renewItems({
                    type: 'roles',
                    action: {
                        kind: 'getRoles',
                    },
                })
            );
    }

    /**
     * Removes the currently authenticated user from the project
     */
    public async leaveProject(options: { projectId: UUID }): Promise<null> {
        return this.subscriptionHandler
            .getOneItem({
                type: 'users',
                action: {
                    kind: 'getUser',
                },
            })
            .then(async (user) =>
                this.removeUser({ ...options, userId: user.id })
            )
            .finally(async () =>
                // If the user gets removed from the project the project isn't accessible to the user anymore too
                this.subscriptionHandler.renewItems({
                    type: 'projects',
                    action: {
                        kind: 'getProjects',
                    },
                })
            );
    }
}
