import type { OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Form } from '@shared/inputs/form';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-invite-modal',
    templateUrl: './invite-modal.component.html',
    styleUrls: ['./invite-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteModalComponent extends Destroyed implements OnDestroy {
    public projectId?: UUID;
    public readonly invitationForm = new Form([
        new StringInput('email', null, {
            kind: 'email',
            validators: [
                CustomValidators.required(),
                (value) =>
                    !value || !this.projectEmails.includes(value)
                        ? null
                        : {
                              emailAlreadyInProject: {
                                  value,
                                  translationKey: _(
                                      'validators.error.emailAlreadyInProject'
                                  ),
                              },
                          },
            ],
            placeholder: _('pages.projects.inviteModal.emailPlaceholder'),
        }),
    ]);
    public projectEmails: ReadonlyArray<string> = [];
    public invitingUser?: Promise<unknown>;

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly rolesService: RolesService,
        private readonly messageService: MessageService
    ) {
        super();
    }

    public inviteUser() {
        if (!this.projectId) {
            errors.error({
                message: 'ProjectId is not defined',
            });
            return;
        }
        if (this.invitationForm.invalid) {
            return;
        }
        this.invitingUser = this.rolesService
            .inviteUser(this.projectId, this.invitationForm.controls[0]!.value!)
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.roles.invitation-success-message.title'),
                    body: _('pages.roles.invitation-success-message.body'),
                });
                this.bsModalRef.hide();
            });
    }

    ngOnDestroy() {
        this.invitationForm.destroy();
        this.destroyed.next(undefined);
    }
}
