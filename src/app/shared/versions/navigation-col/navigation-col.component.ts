import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Version } from '@cache-server/api/versions/version';
import { Breakpoints } from '@core/utility/window-values/breakpoints';

@Component({
    selector: 'app-navigation-col',
    templateUrl: './navigation-col.component.html',
    styleUrls: ['./navigation-col.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationColComponent {
    @Input() version!: Version;

    public readonly breakpoints = Breakpoints;
}
