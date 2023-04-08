import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { MessageService } from '@core/utility/messages/message.service';
import { makeCustom } from '@shared/inputs/input/input';
import { Option } from '@shared/inputs/select-input/option';
import { SelectInput } from '@shared/inputs/select-input/select-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-change-authentication-email',
    templateUrl: './change-authentication-email.component.html',
    styleUrls: ['./change-authentication-email.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAuthenticationEmailComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    public authEmailChanging?: Promise<unknown>;
    public token?: string;
    public onlyOneEmailVerified = false;
    public chooseNewAuthEmailInput?: SelectInput<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        const params = this.activatedRoute.snapshot.queryParams;
        if (params.token) {
            if (!/^.+\..+\..+$/u.test(params.token)) {
                this.messageService.postMessage({
                    color: 'danger',
                    title: _('messages.user.change-auth-mail.invalid.title'),
                    body: _('messages.user.change-auth-mail.invalid.body'),
                });
                delete this.token;
            } else {
                this.token = params.token;
            }
        }
        this.usersService
            .getUser()
            .pipe(takeUntil(this.destroyed))
            .subscribe((user) => {
                if (this.chooseNewAuthEmailInput) {
                    this.chooseNewAuthEmailInput.destroy();
                    this.chooseNewAuthEmailInput = undefined;
                }
                const emailOptions: Option<string>[] = [];
                for (const email of Object.keys(user.emails)) {
                    if (email !== user.authenticationEmail) {
                        emailOptions.push(
                            new Option(email, {
                                text: email,
                                kind: 'string',
                            })
                        );
                    }
                }
                if (emailOptions.length > 0) {
                    this.onlyOneEmailVerified = false;
                    this.chooseNewAuthEmailInput = makeCustom(
                        new SelectInput(
                            'choose-new-auth-email',
                            emailOptions[0]!.value,
                            emailOptions as readonly Option<string>[]
                        ),
                        {
                            leftAddons: [
                                {
                                    translateKey: _(
                                        'user.change-auth-mail-input.name'
                                    ),
                                    icon: 'authentication-email',
                                },
                            ],
                        }
                    );
                } else {
                    this.onlyOneEmailVerified = true;
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    public changeAuthEmail() {
        errors.assert(!!this.token && !!this.chooseNewAuthEmailInput);
        this.authEmailChanging = this.usersService
            .changeAuthEmail(this.chooseNewAuthEmailInput.value, this.token)
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'messages.user.change-auth-mail.change-success.title'
                    ),
                    body: _(
                        'messages.user.change-auth-mail.change-success.body'
                    ),
                });
                this.router.navigateByUrl('/');
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.chooseNewAuthEmailInput?.destroy();
    }
}
