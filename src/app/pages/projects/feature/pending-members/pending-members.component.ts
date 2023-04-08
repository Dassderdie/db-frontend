import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Project } from '@cache-server/api/projects/project';
import type { PendingRole } from '@cache-server/api/roles/pending-role';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';

@Component({
    selector: 'app-pending-members',
    templateUrl: './pending-members.component.html',
    styleUrls: ['./pending-members.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingMembersComponent {
    @Input() project!: Project;
    @Input() pendingRoles!: ReadonlyArray<PendingRole>;

    constructor(
        private readonly rolesService: RolesService,
        private readonly messageService: MessageService,
        private readonly confirmationModalService: ConfirmationModalService
    ) {}

    public async revokeInvitation(role: PendingRole) {
        const confirm = await this.confirmationModalService.confirm({
            title: _(
                'pages.projects.generalSettings.confirm-invitation-revoke.title'
            ),
            description: _(
                'pages.projects.generalSettings.confirm-invitation-revoke.description'
            ),
            btnOkText: _(
                'pages.projects.generalSettings.confirm-invitation-revoke.btnOkText'
            ),
            kind: 'danger',
        });
        if (!confirm) {
            return;
        }
        this.rolesService
            .removeUser(this.project.id, {
                email: role.email,
            })
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'pages.roles.revoke-invitation-success-message.title'
                    ),
                    body: _(
                        'pages.roles.revoke-invitation-success-message.body'
                    ),
                })
            );
    }
}
