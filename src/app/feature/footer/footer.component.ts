import type { OnDestroy } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
} from '@angular/core';
import { CustomerConfigurationService } from '@core/utility/customer-configuration/customer-configuration.service';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import packageInfo from 'package.json';
import { BehaviorSubject, merge } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent extends Destroyed implements OnDestroy {
    @Output() readonly scrollToTop = new EventEmitter<unknown>();
    public readonly environment = environment;
    // To access window in template
    public readonly version = packageInfo.version;
    public readonly showScrollToTopButton$ = new BehaviorSubject(false);

    constructor(
        public readonly customerConfigurationService: CustomerConfigurationService,
        windowsValuesService: WindowValuesService
    ) {
        super();
        merge(
            windowsValuesService.viewportHeight$,
            windowsValuesService.scrollEvent$
        )
            .pipe(
                map(() => window.scrollY > 200),
                distinctUntilChanged(),
                takeUntil(this.destroyed)
            )
            .subscribe(this.showScrollToTopButton$);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
