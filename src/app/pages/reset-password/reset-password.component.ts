import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Form } from '@shared/inputs/form';
import { makeCustom } from '@shared/inputs/input/input';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { userValidators } from '@shared/utility/user-validators';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    public passwordResetting?: Promise<unknown>;
    public requestingPasswordResetEmail?: Promise<unknown>;

    public readonly emailInput = makeCustom(
        new StringInput('email-input', null, {
            validators: userValidators.email,
            kind: 'email',
            autocomplete: 'email',
        }),
        {
            leftAddons: [
                {
                    translateKey: _('auth.reset-password.email.email'),
                    icon: 'authentication-email',
                },
            ],
        }
    );
    public readonly passwordForm = new Form([
        makeCustom(
            new StringInput('new-password', null, {
                validators: userValidators.password,
                kind: 'password',
                autocomplete: 'new-password',
            }),
            {
                leftAddons: [
                    {
                        translateKey: _('auth.reset-password.new-password'),
                    },
                ],
            }
        ),
        makeCustom(
            new StringInput('confirm-password', null, {
                kind: 'password',
                autocomplete: 'new-password',
            }),
            {
                leftAddons: [
                    {
                        translateKey: _('auth.reset-password.confirm'),
                    },
                ],
            }
        ),
    ] as const);

    public token?: string;

    constructor(
        private readonly authService: AuthService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly usersService: UsersService
    ) {
        super();
    }

    ngOnInit() {
        const params = this.activatedRoute.snapshot.queryParams;
        if (params.token) {
            if (!/^.+\..+\..+$/u.test(params.token)) {
                this.messageService.postMessage({
                    color: 'danger',
                    title: _('messages.auth.reset-password.invalid.title'),
                    body: _('messages.auth.reset-password.invalid.body'),
                });
                this.token = undefined;
            } else {
                this.token = params.token;
            }
        }
        this.passwordForm.controls[1].setValidators([
            CustomValidators.required(),
            userValidators.confirmPassword(
                () => this.passwordForm.controls[0].value
            ),
        ]);
    }

    public requestResetPasswordEmail() {
        this.requestingPasswordResetEmail = this.usersService
            .requestResetPassword(this.emailInput.value!)
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'messages.auth.reset-password.email-success.title'
                    ),
                    body: _('messages.auth.reset-password.email-success.body'),
                });
                this.router.navigateByUrl('/');
            });
    }

    public resetPassword() {
        if (!this.token) {
            errors.error({ message: 'Token is null' });
            return;
        }
        this.passwordResetting = this.authService
            .resetPassword(this.token, this.passwordForm.controls[0].value!)
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('messages.auth.reset-password.password-success'),
                });
                this.router.navigateByUrl('/login');
            });
    }

    ngOnDestroy() {
        this.emailInput.destroy();
        this.passwordForm.destroy();
        this.destroyed.next(undefined);
    }
}
