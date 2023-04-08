import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthModalService } from '@core/auth-modal/auth-modal.service';
import { CustomerConfigurationService } from '@core/utility/customer-configuration/customer-configuration.service';
import { languages } from '@core/utility/i18n/languages';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
    public readonly languages = languages;
    public readonly environment = environment;

    constructor(
        private readonly authModalService: AuthModalService,
        public readonly customerConfigurationService: CustomerConfigurationService
    ) {}

    public openAuthModal(preSelectedTab: 'login' | 'register') {
        this.authModalService.show(preSelectedTab);
    }
}
