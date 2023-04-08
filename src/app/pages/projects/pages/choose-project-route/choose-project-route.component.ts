import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Project } from '@cache-server/api/projects/project';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-choose-project-route',
    templateUrl: './choose-project-route.component.html',
    styleUrls: ['./choose-project-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseProjectRouteComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    // To use it in template
    public readonly breakpoints = Breakpoints;

    public project?: Project;
    /**
     * Wether the user is the only admin in this project
     */
    public isLastAdmin?: boolean;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly projectsService: ProjectsService,
        private readonly confirmationModalService: ConfirmationModalService,
        public readonly rolesService: RolesService,
        public readonly messageService: MessageService,
        private readonly router: Router,
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
                switchMap((project) => {
                    this.project = project;
                    this.changeDetectorRef.markForCheck();

                    return this.rolesService
                        .getRolesInProject(project.id, project)
                        .pipe(
                            map((roles) => ({
                                project,
                                roles,
                            }))
                        );
                }),
                takeUntil(this.destroyed)
            )
            .subscribe(({ roles, project }) => {
                this.isLastAdmin =
                    project.authenticatedUserRole.administrator &&
                    !roles.roles.some(
                        (role) =>
                            role.administrator &&
                            role.user.id !==
                                project.authenticatedUserRole.userId
                    );
                this.changeDetectorRef.markForCheck();
            });
    }

    public leaveProject() {
        errors.assert(!!this.project);
        this.confirmationModalService
            .confirm({
                title: _('pages.projects.generalSettings.confirmLeave.title'),
                description: _(
                    'pages.projects.generalSettings.confirmLeave.description'
                ),
                btnOkText: _(
                    'pages.projects.generalSettings.confirmLeave.btnOkText'
                ),
                confirmationString: this.project.name,
                kind: 'danger',
            })
            .then((confirm) => {
                if (!confirm) {
                    return;
                }
                errors.assert(!!this.project);
                this.rolesService.leaveProject(this.project.id).then(() => {
                    this.messageService.postMessage({
                        color: 'success',
                        title: _('pages.projects.leave-success-message.title'),
                        body: _('pages.projects.leave-success-message.body'),
                    });
                    this.router.navigate(['projects']);
                });
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
