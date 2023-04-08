import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthModalService } from '@core/auth-modal/auth-modal.service';
import { AuthService } from '@core/cache-client/api/auth/auth.service';
import { CacheClientService } from '@core/cache-client/cache-client.service';
import { ServiceWorkerService } from '@core/service-worker/service-worker.service';
import { MessageService } from '@core/utility/messages/message.service';
import { ErrorsService } from '@core/utility/errors/errors.service';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    constructor(
        private readonly router: Router,
        private readonly authModalService: AuthModalService,
        private readonly messageService: MessageService,
        private readonly cacheClientService: CacheClientService,
        private readonly serviceWorkerService: ServiceWorkerService,
        private readonly authService: AuthService,
        errorsService: ErrorsService,
        i18nService: I18nService
    ) {
        this.serviceWorkerService.startUpdateChecking();
        errorsService.initialize();
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.url === '/login') {
                    this.authModalService.show('login');
                    this.router.navigate(['../']);
                } else if (event.url === '/register') {
                    this.authModalService.show('register');
                    this.router.navigate(['../']);
                }
            }
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        this.cacheClientService.authEvent$.subscribe((event) => {
            switch (event) {
                case 'logged-in':
                    this.authModalService.hide();
                    break;
                case 'renew-login':
                    this.authModalService.show('login').then((notAborted) => {
                        if (!notAborted) {
                            this.authService.logout();
                        }
                    });
                    break;
                case 'logout':
                    this.router
                        .navigate(['/'])
                        .then(() =>
                            this.cacheClientService.cleanUpAfterLogout()
                        );
                    this.messageService.postMessage({
                        color: 'success',
                        title: _('messages.auth.logout.title'),
                        body: _('messages.auth.logout.body'),
                    });
                    break;
                default:
                    errors.error({
                        message: `Unknown event!`,
                        logValues: { event },
                    });
            }
        });
        if (
            environment.hasPrivacyPolicy &&
            environment.showPrivacyPolicyWarning
        ) {
            i18nService.languageChangesIso639_2$
                .pipe(filter((language) => language === 'eng'))
                // eslint-disable-next-line rxjs-angular/prefer-takeuntil
                .subscribe((language) => {
                    this.messageService.postMessage(
                        {
                            color: 'warning',
                            title: _('messages.officially-only-german.title'),
                            body: _('messages.officially-only-german.body'),
                        },
                        'toast',
                        30000
                    );
                });
        }
    }

    public scrollToTop() {
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
}
