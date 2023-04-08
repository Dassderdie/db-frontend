import type { OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticatedService } from '@core/cache-client/authenticated.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends Destroyed implements OnDestroy {
    public readonly breakpoints = Breakpoints;

    public showReleasesStartingFrom: number;

    constructor(public readonly authenticatedService: AuthenticatedService) {
        super();
        // only show release-notes from the last 3 days
        this.showReleasesStartingFrom = Date.now() - 3 * 24 * 60 * 60 * 1000;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
