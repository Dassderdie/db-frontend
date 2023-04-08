import { isEqual } from 'lodash-es';
import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export class ProgressCounter {
    private maximum = 0;
    private readonly progressE$ = new ReplaySubject<{
        maximum: number;
        current: number;
    }>(1);
    public readonly progress$ = this.progressE$.pipe(
        distinctUntilChanged(isEqual)
    );
    private current = 0;

    public updateProgress(progressMade: number) {
        this.current += progressMade;
        errors.assert(this.current <= this.maximum, { status: 'logWarning' });
        this.progressE$.next({ maximum: this.maximum, current: this.current });
    }

    public updateMaximum(newMax: number) {
        this.maximum = newMax;
        this.updateProgress(0);
    }

    public destroy() {
        this.progressE$.next({ maximum: this.maximum, current: this.maximum });
        this.progressE$.complete();
    }
}
