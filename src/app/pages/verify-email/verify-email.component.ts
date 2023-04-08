import type { OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { AuthenticatedService } from '@core/cache-client/authenticated.service';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent implements OnInit {
    public status: 'error' | 'in-progress' | 'success' = 'in-progress';

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly usersService: UsersService,
        public readonly authenticatedService: AuthenticatedService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        const token = this.activatedRoute.snapshot.queryParamMap.get('token');
        if (token !== null) {
            this.usersService
                .verifyEmail(token)
                .then(() => {
                    this.status = 'success';
                    this.changeDetectorRef.markForCheck();
                })
                .catch(() => {
                    this.status = 'error';
                    this.changeDetectorRef.markForCheck();
                });
        } else {
            errors.error({ message: 'token is undefined' });
        }
    }
}
