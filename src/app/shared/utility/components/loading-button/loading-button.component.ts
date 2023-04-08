import type { OnChanges, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { IconType } from '@main-shared/icon/icon-type';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { Observable } from 'rxjs';
import { ReplaySubject, from } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-loading-button',
    templateUrl: './loading-button.component.html',
    styleUrls: ['./loading-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingButtonComponent
    extends Destroyed
    implements OnDestroy, OnChanges
{
    @Input() title = '';
    @Input() newEvent?: Observable<unknown> | Promise<unknown>;
    @Input() type:
        | 'danger'
        | 'outline-danger'
        | 'outline-primary'
        | 'outline-secondary'
        | 'outline-success'
        | 'outline-warning'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning' = 'warning';
    /**
     * Force the input to be disabled/enabled (null -> while loading disabled)
     */
    @Input() disabled: boolean | null = null;
    @Input() timeout = 500;
    @Input() small = false;
    @Input() additionalStyles: { [styleName: string]: unknown } | null = null;
    @Input() icons: ReadonlyArray<IconType> = [];

    /**
     * Whether to show loading animation
     */
    public displayLoadingE$ = new ReplaySubject<boolean>(1);

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.newEvent && this.newEvent) {
            this.displayLoadingE$.next(true);
            from(this.newEvent)
                .pipe(debounceTime(this.timeout), takeUntil(this.destroyed))
                .subscribe({
                    error: (error: any) => {
                        this.displayLoadingE$.next(false);
                    },
                    complete: () => {
                        this.displayLoadingE$.next(false);
                    },
                });
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
