import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Role } from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import { CheckboxInput } from '@shared/inputs/checkbox-input/checkbox-input';
import { Form } from '@shared/inputs/form';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberComponent
    extends DeactivationDirective
    implements OnInit, OnDestroy, Destroyed
{
    private memberId?: string;
    private projectId?: UUID;
    public role?: Role;
    public ownRole?: Role;
    public changingRole?: Promise<unknown>;
    public permissionsForm?: Form<
        [CheckboxInput<string>, CheckboxInput<string>, CheckboxInput<string>]
    >;

    readonly destroyed = new Subject();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly messageService: MessageService,
        private readonly rolesService: RolesService,
        confirmationModalService: ConfirmationModalService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super(confirmationModalService);
    }

    ngOnInit() {
        this.addDeactivationGuard(
            () => !this.permissionsForm || this.permissionsForm.changed
        );
        const params$ = this.activatedRoute.params.pipe(
            map((params) => ({
                memberId: params.member,
                projectId: params.project,
            }))
        );
        params$
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ projectId, memberId }) => {
                this.projectId = projectId;
                this.memberId = memberId;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId, memberId }) =>
                    this.rolesService.getRole(projectId, memberId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((role) => {
                this.role = role;
                this.updatePermissionsForm(role);
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.rolesService.getRole(projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((ownRole) => {
                this.ownRole = ownRole;
                this.changeDetectorRef.markForCheck();
            });
    }

    private updatePermissionsForm(role: Role) {
        if (!this.permissionsForm) {
            this.permissionsForm = new Form([
                new CheckboxInput(
                    'inviteUsers',
                    role.inviteUsers,
                    _('pages.projects.project-member.form.invite.displayName'),
                    'translate'
                ),
                new CheckboxInput(
                    'givePermissions',
                    role.givePermissions,
                    _(
                        'pages.projects.project-member.form.permissions.displayName'
                    ),
                    'translate'
                ),
                new CheckboxInput(
                    'admin',
                    role.administrator,
                    _('pages.projects.project-member.form.admin.displayName'),
                    'translate'
                ),
            ]);
            this.permissionsForm.controls[2].value$
                .pipe(takeUntil(this.destroyed))
                .subscribe((keyValue) => {
                    if (!this.permissionsForm) {
                        errors.error({
                            message: 'PermissionsForm is undefined',
                        });
                        return;
                    }
                    if (this.permissionsForm.controls[2].value) {
                        this.permissionsForm.controls[0].setValue(true);
                        this.permissionsForm.controls[0].setDisabled(true);
                        this.permissionsForm.controls[1].setValue(true);
                        this.permissionsForm.controls[1].setDisabled(true);
                    } else {
                        this.permissionsForm.controls[0].setDisabled(false);
                        this.permissionsForm.controls[1].setDisabled(false);
                    }
                    this.changeDetectorRef.markForCheck();
                });
        } else {
            this.permissionsForm.controls[0].setInitialValue(role.inviteUsers);
            this.permissionsForm.controls[1].setInitialValue(
                role.givePermissions
            );
            this.permissionsForm.controls[2].setInitialValue(
                role.administrator
            );
        }
    }

    public submitProjectRoles() {
        errors.assert(
            !!this.projectId && !!this.memberId && !!this.permissionsForm
        );
        this.changingRole = this.rolesService
            .changeRole(
                this.projectId,
                this.memberId,
                this.permissionsForm.controls[0].value,
                this.permissionsForm.controls[1].value,
                this.permissionsForm.controls[2].value
            )
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.members.edit-success-message.title'),
                    body: _('pages.members.edit-success-message.body'),
                });
            });
    }

    ngOnDestroy() {
        this.permissionsForm?.destroy();
        this.destroyed.next(undefined);
    }
}
