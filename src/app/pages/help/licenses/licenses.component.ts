import { HttpClient } from '@angular/common/http';
import type { OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicensesComponent extends Destroyed implements OnDestroy {
    public licenses?: string;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
        this.httpClient
            .get('/3rdpartylicenses.txt', { responseType: 'text' })
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                this.licenses = result;
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
