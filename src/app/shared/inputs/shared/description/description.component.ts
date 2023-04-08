import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Languages } from '@core/utility/i18n/languages';

@Component({
    selector: 'app-description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionComponent {
    @Input() description!: Languages<string | null> | string | undefined;
}
