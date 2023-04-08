import { Injectable } from '@angular/core';
import type { Project } from '@cache-server/api/projects/project';
import type { FiltersPreferences, Role } from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import { mergeMap } from 'rxjs/operators';
import { CacheClientService } from '../../cache-client.service';
import { UsersService } from '../users/users.service';

@Injectable({
    providedIn: 'root',
})
export class RolesService {
    constructor(
        private readonly cacheClientService: CacheClientService,
        private readonly usersService: UsersService
    ) {}

    /**
     * Gets all roles in a project
     * @param projectId Id of project
     * @param project optional to determine wether pending/revoked roles can be received too
     */
    public getRolesInProject(projectId: UUID, project?: Project) {
        return this.cacheClientService.handleSubscribeAction({
            type: 'roles',
            action: {
                kind: 'getRoles',
                options: {
                    projectId,
                    pendingRoles: !!project?.authenticatedUserRole.inviteUsers,
                    revokedRoles:
                        !!project?.authenticatedUserRole.administrator,
                },
            },
        });
    }

    /**
     * Gets information about a single role
     * @param projectId Id of the project
     * @param userId userId of the role's user (if not provided the currently authenticated user is default)
     */
    public getRole(projectId: UUID, userId?: UUID) {
        const getRoleAction = (userIdP: UUID) =>
            this.cacheClientService.handleSubscribeAction({
                type: 'roles',
                action: {
                    kind: 'getRole',
                    options: {
                        projectId,
                        userId: userIdP,
                    },
                },
            });
        if (!userId) {
            return this.usersService
                .getUser()
                .pipe(mergeMap((user) => getRoleAction(user.id)));
        }
        return getRoleAction(userId);
    }

    /**
     * Updates role of user in project
     * @param projectId Id of the project
     * @param userId userId of the role's user
     * @param inviteUser Permission to invite users
     * @param givePermissions Permission to give permissions
     * @param administrator full control over project
     */
    public async changeRole(
        projectId: UUID,
        userId: string,
        inviteUsers: boolean,
        givePermissions: boolean,
        administrator: boolean
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'editRole',
                options: {
                    projectId,
                    userId,
                    inviteUsers,
                    givePermissions,
                    administrator,
                },
            },
        });
    }

    /**
     * Updates the favorite tables of a user in a project
     * @param projectId the project for which the favorite tables are set
     * @param favoriteTables the new favorite tables
     */
    public async updateFavoriteTables(
        projectId: UUID,
        favoriteTables: Role['preferences']['favoriteTables']
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'editFavoriteTables',
                options: {
                    projectId,
                    favoriteTables,
                },
            },
        });
    }

    /**
     * Edits the tableViews of a member in a project
     */
    public async editTableViews(
        projectId: UUID,
        tableViews: Role['preferences']['tableViews']
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'editTableViews',
                options: {
                    projectId,
                    tableViews,
                },
            },
        });
    }

    public async editFiltersPreferences(
        projectId: UUID,
        filters: FiltersPreferences
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'editFilters',
                options: {
                    projectId,
                    filters,
                },
            },
        });
    }

    public async editColumnOrdersPreferences(
        projectId: UUID,
        columnOrders: Role['preferences']['columnOrders']
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'editColumnOrders',
                options: {
                    projectId,
                    columnOrders,
                },
            },
        });
    }

    /**
     * Invites an user to a project
     */
    public async inviteUser(projectId: UUID, email: string) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'inviteUser',
                options: {
                    projectId,
                    email,
                },
            },
        });
    }

    /**
     * Accepts a invitation using a invitation token.
     * This token can be obtained from a invitation email and contains all the necessary information about the invitation.
     */
    public async acceptInvitation(invitationToken: string) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'acceptInvitation',
                options: {
                    invitationToken,
                },
            },
        });
    }

    public async leaveProject(projectId: UUID) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'leaveProject',
                options: {
                    projectId,
                },
            },
        });
    }

    /**
     * Removes an user from a project
     * @param userId userId of user to remove
     * @param email the email of the user to remove
     */
    public async removeUser(
        projectId: UUID,
        id: { email: string } | { userId: UUID }
    ) {
        return this.cacheClientService.handleAction({
            type: 'roles',
            action: {
                kind: 'removeUser',
                options: {
                    projectId,
                    ...id,
                },
            },
        } as  // TODO: remove workaround for type resolution
            | {
                  type: 'roles';
                  action: {
                      kind: 'removeUser';
                      options: {
                          projectId: UUID;
                          email: UUID;
                      };
                  };
              }
            | {
                  type: 'roles';
                  action: {
                      kind: 'removeUser';
                      options: {
                          projectId: UUID;
                          userId: UUID;
                      };
                  };
              });
    }
}
