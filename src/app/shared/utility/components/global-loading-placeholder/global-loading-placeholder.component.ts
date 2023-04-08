import type { AfterViewInit, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { ProgressCounter } from '@shared/utility/components/global-loading-placeholder/progress-counter';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-global-loading-placeholder',
    templateUrl: './global-loading-placeholder.component.html',
    styleUrls: ['./global-loading-placeholder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalLoadingPlaceholderComponent
    extends Destroyed
    implements AfterViewInit, OnDestroy
{
    public progressCounter!: ProgressCounter;
    public description!: string;

    constructor(public readonly bsModalRef: BsModalRef) {
        super();
    }

    ngAfterViewInit() {
        this.progressCounter.progress$
            .pipe(takeUntil(this.destroyed))
            .subscribe({
                complete: () => this.bsModalRef.hide(),
            });
    }

    public abort() {
        this.bsModalRef.hide();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
