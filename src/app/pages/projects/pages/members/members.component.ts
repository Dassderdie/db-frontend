import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Project } from '@cache-server/api/projects/project';
import type { PendingRole } from '@cache-server/api/roles/pending-role';
import type { Role } from '@cache-server/api/roles/role';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { InviteModalComponent } from '@projects/feature/invite-modal/invite-modal.component';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { BsModalService } from 'ngx-bootstrap/modal';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-members',
    templateUrl: './members.component.html',
    styleUrls: ['./members.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersComponent extends Destroyed implements OnInit, OnDestroy {
    public readonly breakpoints = Breakpoints;
    public roles?: ReadonlyArray<Role>;
    public revokedRoles?: ReadonlyArray<Role>;
    public pendingRoles?: ReadonlyArray<PendingRole>;
    public project?: Project;
    public filteredRoles?: ReadonlyArray<Role>;
    public filteredPendingRoles?: ReadonlyArray<PendingRole>;
    public filteredRevokedRoles?: ReadonlyArray<Role>;
    public searchText = '';

    constructor(
        private readonly rolesService: RolesService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly projectsService: ProjectsService,
        private readonly bsModalService: BsModalService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.activatedRoute.params
            .pipe(
                switchMap((params) =>
                    this.projectsService.getProject(params.project)
                ),
                tap((project) => {
                    this.project = project;
                    this.changeDetectorRef.markForCheck();
                }),
                switchMap((project) =>
                    this.rolesService.getRolesInProject(project.id, project)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((rolesInProject) => {
                this.roles = rolesInProject.roles.filter(
                    (role) => !role.revokedAt
                );
                this.revokedRoles = rolesInProject.roles.filter(
                    (role) => !!role.revokedAt
                );
                this.pendingRoles = rolesInProject.pendingRoles ?? [];
                this.updateFilteredRoles();
                this.changeDetectorRef.markForCheck();
            });
    }

    public openInviteModal() {
        errors.assert(!!this.project && !!this.roles && !!this.pendingRoles);
        // Open after emails are loaded
        this.bsModalService.show(InviteModalComponent, {
            initialState: {
                projectEmails: [
                    ...this.roles.map((role) => role.user.authenticationEmail),
                    ...this.pendingRoles
                        .filter((role) => !role.declined)
                        .map((role) => role.email),
                ],
                projectId: this.project.id,
            },
        });
    }

    public updateFilteredRoles() {
        this.filteredRoles = this.roles?.filter((role) =>
            this.filterRole(role.user.name)
        );
        this.filteredRevokedRoles = this.revokedRoles?.filter((role) =>
            this.filterRole(role.user.name)
        );
        this.filteredPendingRoles = this.pendingRoles?.filter(
            (role) => !role.declined && this.filterRole(role.email)
        );
    }

    /**
     * @param name the string in which the searchString should occur
     * @returns wether the provided values match the filter
     */
    private filterRole(name: string) {
        return name.toUpperCase().includes(this.searchText.toUpperCase());
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
