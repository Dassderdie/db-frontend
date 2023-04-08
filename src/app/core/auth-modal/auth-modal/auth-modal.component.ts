import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ViewChild,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Form } from '@shared/inputs/form';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { userValidators } from '@shared/utility/user-validators';
import { environment } from 'src/environments/environment';
import { EmailVerificationModalComponent } from '../email-verification-modal/email-verification-modal.component';

@Component({
    selector: 'app-auth-modal',
    templateUrl: './auth-modal.component.html',
    styleUrls: ['./auth-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent
    extends Destroyed
    implements OnInit, OnDestroy, AfterViewInit
{
    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly authService: AuthService,
        private readonly messageService: MessageService,
        private readonly bsModalService: BsModalService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    // TODO: [>0.4]
    public readonly environment = environment;

    /**
     * the translationKeys for the labels of the loginForm
     */
    public readonly loginFormLabelKeys = [
        _('auth.auth-modal.login.email.name'),
        _('auth.auth-modal.login.password.name'),
    ];
    /**
     * the inputs of the loginForm should be invalid while loginError is true
     */
    private readonly hasLoginError$ = new BehaviorSubject(false);
    private readonly loginError$ = this.hasLoginError$.asObservable().pipe(
        map((error) =>
            error
                ? {
                      loginError: {
                          value: null,
                          translationKey: _('empty-translation'),
                      },
                  }
                : null
        )
    );

    public readonly loginForm = new Form([
        new StringInput('loginEmail', null, {
            kind: 'email',
            placeholder: _('auth.auth-modal.login.email.placeholder'),
            validators: [CustomValidators.required()],
            asyncValidators: [() => this.loginError$],
            // https://stackoverflow.com/questions/53173806/what-should-be-correct-autocomplete-for-username-email
            autocomplete: 'username',
        }),
        new StringInput('loginPassword', null, {
            kind: 'password',
            placeholder: _('auth.auth-modal.login.password.placeholder'),
            validators: [CustomValidators.required()],
            asyncValidators: [() => this.loginError$],
            autocomplete: 'current-password',
        }),
    ] as const);

    /**
     * the translationKeys for the labels of the registerForm
     */
    public readonly registerFormLabelKeys = [
        _('auth.auth-modal.register.name.name'),
        _('auth.auth-modal.register.email.name'),
        _('auth.auth-modal.register.password.name'),
        _('auth.auth-modal.register.confirmPassword.name'),
    ];
    public readonly registerForm = new Form([
        new StringInput('registerName', null, {
            kind: 'string',
            placeholder: _('auth.auth-modal.register.name.placeholder'),
            validators: userValidators.username,
            autocomplete: 'name',
        }),
        new StringInput('registerEmail', null, {
            kind: 'email',
            placeholder: _('auth.auth-modal.register.email.placeholder'),
            validators: userValidators.email,
            autocomplete: 'email',
        }),
        new StringInput('registerPassword', null, {
            kind: 'password',
            placeholder: _('auth.auth-modal.register.password.placeholder'),
            validators: userValidators.password,
            autocomplete: 'new-password',
        }),
        new StringInput('confirmPassword', null, {
            kind: 'password',
            placeholder: _(
                'auth.auth-modal.register.confirmPassword.placeholder'
            ),
            autocomplete: 'new-password',
        }),
    ] as const);

    @ViewChild('authTabset', { static: true }) authTabset!: TabsetComponent;
    /**
     * Tab selected in the beginning
     * Has to be set before AfterViewInit
     */
    public preSelectedTab!: 'login' | 'register';

    /**
     * Whether the modal should display an error
     */
    public loginError = false;
    public loggingIn?: Promise<unknown>;
    public registrating?: Promise<unknown>;

    ngOnInit() {
        this.registerForm
            .get('confirmPassword')!
            .setValidators([
                userValidators.confirmPassword(
                    () => this.registerForm.controls[2].value
                ),
                ...userValidators.password,
            ]);
    }

    ngAfterViewInit() {
        if (this.preSelectedTab === 'register') {
            this.authTabset.tabs[1]!.active = true;
        }
    }

    public login() {
        if (this.loginForm.invalid) {
            return;
        }
        this.loginError = false;
        this.hasLoginError$.next(this.loginError);
        this.loggingIn = this.authService
            .login(
                this.loginForm.controls[0].value!,
                this.loginForm.controls[1].value!
            )
            .then(() => this.bsModalRef.hide())
            .catch((error) => {
                if (
                    error?.error?.error?.startsWith(
                        'invalidAuthentication.unverifiedEmail'
                    )
                ) {
                    // Tell user, that his email isn't verified yet
                    this.bsModalRef.hide();
                    this.bsModalService.show(EmailVerificationModalComponent);
                } else if (error.status === 403 || error.status === 400) {
                    this.loginError = true;
                    this.hasLoginError$.next(true);
                } else if (error.status !== 0) {
                    errors.error({ error, status: 'logError' });
                    this.messageService.postMessage({
                        color: 'danger',
                        title: _('messages.auth.error.title'),
                        body: _('messages.auth.error.body'),
                        log: error,
                    });
                } else {
                    errors.error({ error });
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    public register() {
        if (this.registerForm.invalid) {
            return;
        }
        this.registrating = this.authService
            .register(
                this.registerForm.controls[0].value!,
                this.registerForm.controls[1].value!,
                this.registerForm.controls[2].value!
            )
            .then(() => {
                this.bsModalRef.hide();
                this.bsModalService.show(EmailVerificationModalComponent);
            })
            .catch((error) => {
                errors.error({ error, status: 'logError' });
                this.messageService.postMessage({
                    color: 'danger',
                    title: _('messages.auth.error.title'),
                    body: _('messages.auth.error.body'),
                });
            });
    }

    public resetError() {
        this.loginError = false;
        this.hasLoginError$.next(this.loginError);
    }

    ngOnDestroy() {
        this.loginForm.destroy();
        this.registerForm.destroy();
        this.destroyed.next(undefined);
    }
}
