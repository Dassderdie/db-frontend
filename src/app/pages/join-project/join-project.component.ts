import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { User } from '@cache-server/api/users/user';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { AuthenticatedService } from '@core/cache-client/authenticated.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-join-project',
    templateUrl: './join-project.component.html',
    styleUrls: ['./join-project.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinProjectComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    public token?: string;
    public invitation?: Invitation;
    public invitationExpired?: boolean;
    public timer?: NodeJS.Timeout;
    public user?: User;

    constructor(
        public readonly authenticatedService: AuthenticatedService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly usersService: UsersService,
        private readonly messageService: MessageService,
        private readonly rolesService: RolesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.activatedRoute.queryParamMap
            .pipe(
                map((query) => query.get('token')),
                takeUntil(this.destroyed)
            )
            .subscribe((token) => {
                if (token) {
                    try {
                        this.invitation = JSON.parse(
                            atob(token.split('.')[1]!)
                        );
                        this.token = token;
                        // Because JWT uses seconds instead of milliseconds as a timeunit
                        let remainingTime =
                            this.invitation!.exp! * 1000 - Date.now();
                        if (remainingTime < 0) {
                            remainingTime = 0;
                        }
                        this.invitationExpired = !remainingTime;
                        if (this.timer) {
                            clearTimeout(this.timer);
                        }
                        this.timer = setTimeout(() => {
                            this.invitationExpired = true;
                        }, remainingTime);
                    } catch {
                        errors.error({ message: 'Invalid token!' });
                    }
                } else {
                    errors.error({
                        message: 'No token provided!',
                    });
                }
                this.changeDetectorRef.markForCheck();
            });
        this.usersService
            .getUser()
            .pipe(takeUntil(this.destroyed))
            .subscribe((user) => {
                this.user = user;
                this.changeDetectorRef.markForCheck();
            });
    }

    public acceptInvitation() {
        if (this.token) {
            this.rolesService.acceptInvitation(this.token).then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.join-project.accept-success-message.title'),
                    body: _('pages.join-project.accept-success-message.body'),
                });
                if (this.invitation) {
                    this.router.navigate([
                        'projects',
                        this.invitation.projectId,
                    ]);
                }
            });
        } else {
            errors.error({
                message: 'No invitation!',
            });
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}

interface Invitation {
    readonly projectId?: string;
    readonly projectName?: string;
    readonly exp?: number;
    readonly sub?: string;
    readonly iat?: number;
}
