import type { OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { User } from '@cache-server/api/users/user';
import { AuthModalService } from '@core/auth-modal/auth-modal.service';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { AuthenticatedService } from '@core/cache-client/authenticated.service';
import { languages } from '@core/utility/i18n/languages';
import { languageIcons } from '@main-shared/icon/language-icons';
import { TranslateService } from '@ngx-translate/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent extends Destroyed implements OnDestroy {
    public navbarCollapsed = true;
    // To make languages available in template
    public readonly languages = languages;
    public readonly languageIcons = languageIcons;
    public readonly user$ = new ReplaySubject<User>(1);

    constructor(
        private readonly authService: AuthService,
        public readonly translateService: TranslateService,
        public readonly authenticatedService: AuthenticatedService,
        private readonly usersService: UsersService,
        private readonly authModalService: AuthModalService
    ) {
        super();
        this.usersService
            .getUser()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.user$);
    }

    public openAuthModal() {
        this.authModalService.show('login');
    }

    public logout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.user$.complete();
    }
}
