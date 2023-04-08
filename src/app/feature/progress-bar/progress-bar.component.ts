import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProgressBarService } from '@core/utility/progress-bar/progress-bar.service';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
    constructor(public readonly progressBarService: ProgressBarService) {}
}
