import { ChangeDetectionStrategy, Component } from '@angular/core';
import { languages } from '@core/utility/i18n/languages';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-display-features',
    templateUrl: './display-features.component.html',
    styleUrls: ['./display-features.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayFeaturesComponent {
    public readonly languages = languages;
    public readonly environment = environment;

    constructor(public readonly translateService: TranslateService) {}
}
