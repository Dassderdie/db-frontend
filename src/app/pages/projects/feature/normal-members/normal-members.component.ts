import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Project } from '@cache-server/api/projects/project';
import type { Role } from '@cache-server/api/roles/role';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';

@Component({
    selector: 'app-normal-members',
    templateUrl: './normal-members.component.html',
    styleUrls: ['./normal-members.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NormalMembersComponent {
    @Input() project!: Project;
    @Input() roles!: ReadonlyArray<Role>;

    constructor(
        private readonly rolesService: RolesService,
        private readonly messageService: MessageService,
        private readonly confirmationModalService: ConfirmationModalService
    ) {}

    public async removeRole(role: Role) {
        const confirm = await this.confirmationModalService.confirm({
            title: _('pages.projects.generalSettings.confirmRemove.title'),
            description: _(
                'pages.projects.generalSettings.confirmRemove.description'
            ),
            btnOkText: _(
                'pages.projects.generalSettings.confirmRemove.btnOkText'
            ),
            kind: 'danger',
            confirmationString: role.user.name,
        });
        if (!confirm) {
            return;
        }
        this.rolesService
            .removeUser(this.project.id, {
                userId: role.userId,
            })
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.roles.remove-success-message.title'),
                    body: _('pages.roles.remove-success-message.body'),
                })
            );
    }
}
