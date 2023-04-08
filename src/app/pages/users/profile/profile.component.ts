import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { User } from '@cache-server/api/users/user';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import type { Languages } from '@core/utility/i18n/languages';
import { languages } from '@core/utility/i18n/languages';
import { MessageService } from '@core/utility/messages/message.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import type { Form } from '@shared/inputs/form';
import type { SelectInput } from '@shared/inputs/select-input/select-input';
import { StringInput } from '@shared/inputs/string-input/string-input';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createUserForm } from './create-user-form';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent
    extends DeactivationDirective
    implements OnInit, OnDestroy, Destroyed
{
    // To use it in template
    public breakpoints = Breakpoints;

    readonly destroyed = new Subject();
    public userEditing?: Promise<unknown>;
    public addingEmail?: Promise<unknown>;
    public requestingPasswordResetEmail?: Promise<unknown>;
    public requestingAuthEmailChange?: Promise<unknown>;

    constructor(
        private readonly usersService: UsersService,
        readonly confirmationModalService: ConfirmationModalService,
        private readonly messageService: MessageService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => !!this.userForm?.changed);
    }

    public userForm?: Form<
        readonly [
            StringInput,
            SelectInput<keyof Languages<unknown>>,
            SelectInput<string | null>,
            SelectInput<string>
        ]
    >;

    public readonly addEmailControl = new StringInput('addEmailInput', null, {
        kind: 'email',
        validators: [
            (value) =>
                value && this.user && this.user.emails[value]
                    ? {
                          emailAlreadyVerified: {
                              value,
                              translationKey: _(
                                  'validators.error.emailAlreadyVerified'
                              ),
                          },
                      }
                    : null,
        ],
        placeholder: _('user.add-email-placeholder'),
        autocomplete: 'email',
    });

    public user?: User;

    ngOnInit() {
        this.usersService
            .getUser()
            .pipe(takeUntil(this.destroyed))
            .subscribe((user) => {
                this.user = user;
                if (!this.userForm) {
                    this.userForm = createUserForm(
                        user,
                        this.usersService
                            .getUser()
                            .pipe(takeUntil(this.destroyed))
                    );
                } else {
                    this.userForm.controls[0].setInitialValue(user.name);
                    this.userForm.controls[1].setInitialValue(
                        user.language ? user.language : languages[0]!.id
                    );
                    this.userForm.controls[2].setInitialValue(user.publicEmail);
                    this.userForm.controls[3].setInitialValue(
                        user.notificationEmail
                    );
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    public submitUser() {
        if (!this.userForm) {
            errors.error({ message: 'The userForm is not defined' });
            return;
        }
        this.userEditing = this.usersService
            .editUser(
                this.userForm.controls[0].value!,
                this.userForm.controls[1].value,
                this.userForm.controls[2].value,
                this.userForm.controls[3].value
            )
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.users.edit-success-message.title'),
                    body: _('pages.users.edit-success-message.body'),
                })
            );
    }

    public addEmail(email: string) {
        this.addingEmail = this.usersService.addEmail(email).then(() => {
            this.addEmailControl.setValue(null);
            this.messageService.postMessage({
                color: 'success',
                title: _('messages.user.add-email.email-success.title'),
                body: _('messages.user.add-email.email-success.body'),
            });
        });
    }

    public removeEmail(email: string) {
        this.usersService.removeEmail(email).then(() =>
            this.messageService.postMessage({
                color: 'success',
                title: _('pages.users.remove-email-success-message.title'),
                body: _('pages.users.remove-email-success-message.body'),
            })
        );
    }

    public requestResetPasswordEmail() {
        if (!this.user) {
            errors.error({ message: "user mustn't be undefined" });
            return;
        }
        this.requestingPasswordResetEmail = this.usersService
            .requestResetPassword(this.user.authenticationEmail)
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'messages.auth.reset-password.email-success.title'
                    ),
                    body: _('messages.auth.reset-password.email-success.body'),
                })
            );
    }

    public requestAuthEmailChange() {
        this.requestingAuthEmailChange = this.usersService
            .requestAuthEmailChange()
            .then(() =>
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'messages.auth.request-auth-email-change.email-success.title'
                    ),
                    body: _(
                        'messages.auth.request-auth-email-change.email-success.body'
                    ),
                })
            );
    }

    ngOnDestroy() {
        this.addEmailControl.destroy();
        this.userForm?.destroy();
        this.destroyed.next(undefined);
    }
}
