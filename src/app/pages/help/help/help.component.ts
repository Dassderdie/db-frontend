import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breakpoints } from '@core/utility/window-values/breakpoints';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpComponent {
    public readonly breakpoints = Breakpoints;
}
