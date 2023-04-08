import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Role } from '@cache-server/api/roles/role';
import { anonymousUserId } from '@cache-server/api/users/anonymous-user-id';
import type { User } from '@cache-server/api/users/user';
import { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { Subscription } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-member-name',
    templateUrl: './member-name.component.html',
    styleUrls: ['./member-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays the name of an project member
 * either role or (userId and projectId) have to be specified
 */
export class MemberNameComponent
    extends Destroyed
    implements OnChanges, OnInit, OnDestroy
{
    @Input() role?: Role;
    @Input() userId?: UUID;
    @Input() projectId?: UUID;

    // to use it in the template
    public anonymousUserId = anonymousUserId;
    /**
     * Emits always value of the role that should be displayed
     * if undefined is emitted the role is currently loading
     */
    public role$ = new ReplaySubject<Role | undefined>(1);
    /**
     * The user that is currently authenticated
     */
    public ownUser$ = new ReplaySubject<User>(1);

    constructor(
        public readonly rolesService: RolesService,
        private readonly usersService: UsersService
    ) {
        super();
    }

    ngOnInit() {
        this.usersService
            .getUser()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.ownUser$);
    }

    private roleSubscription?: Subscription;

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.userId || changes.projectId) {
            this.roleSubscription?.unsubscribe();
            if (
                this.userId &&
                this.userId !== anonymousUserId &&
                this.projectId
            ) {
                this.role$.next(undefined);
                this.roleSubscription = this.rolesService
                    .getRole(this.projectId, this.userId)
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(this.role$);
            }
        }
        if (changes.role) {
            this.role$.next(this.role);
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
