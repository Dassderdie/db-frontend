import type { OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CacheClientService } from '@core/cache-client/cache-client.service';
import { ServiceWorkerService } from '@core/service-worker/service-worker.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { ReplaySubject } from 'rxjs';
import { BreadcrumbsService } from '../breadcrumbs.service';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent extends Destroyed implements OnDestroy {
    public readonly synchronizing$ = new ReplaySubject<boolean>(1);
    // To use it in template
    public breakpoints = Breakpoints;

    constructor(
        public readonly breadcrumbsService: BreadcrumbsService,
        private readonly cacheClientService: CacheClientService,
        private readonly serviceWorkerService: ServiceWorkerService
    ) {
        super();
    }

    public syncCache() {
        this.synchronizing$.next(true);
        this.serviceWorkerService.checkForUpdate();
        this.cacheClientService
            .renewAll()
            .catch((error) => {
                this.synchronizing$.next(false);
                errors.error({ error });
            })
            .finally(() =>
                setTimeout(() => this.synchronizing$.next(false), 1000)
            );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
