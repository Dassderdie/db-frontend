import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { fade } from '@shared/animations/fade';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-loading-placeholder',
    templateUrl: './loading-placeholder.component.html',
    styleUrls: ['./loading-placeholder.component.scss'],
    animations: [fade()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingPlaceholderComponent implements OnInit {
    @Input() inline = true;
    /**
     * Time in ms after which the loading placeholder should be displayed
     * if undefined it should be displayed immediately
     */
    @Input() timeout?: number;

    /**
     * emits true when the timeout is over
     */
    public readonly timeoutIsOver$ = new Subject<boolean>();

    ngOnInit() {
        if (this.timeout !== undefined) {
            setTimeout(() => this.timeoutIsOver$.next(true), this.timeout);
        }
    }
}
