import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgressBarService {
    private progressBarStatus: ProgressBarStatus = {
        maximum: 0,
        current: 0,
        status: 'starting',
    };
    public readonly progressBarStatus$ = new BehaviorSubject(
        this.progressBarStatus
    );
    private setNewStatus(changedProperties: Partial<ProgressBarStatus>) {
        this.progressBarStatus = {
            ...this.progressBarStatus,
            ...changedProperties,
        };
        this.progressBarStatus$.next(this.progressBarStatus);
    }

    public addTask() {
        this.setNewStatus({
            maximum: this.progressBarStatus.maximum + 1,
        });
        setTimeout(
            () =>
                this.setNewStatus({
                    status:
                        this.progressBarStatus.status === 'finished'
                            ? 'starting'
                            : 'waiting',
                }),
            0
        );
    }

    public resolveTask() {
        const current = this.progressBarStatus.current + 1;
        errors.assert(
            current <= this.progressBarStatus.maximum && current >= 0
        );
        this.setNewStatus({
            current,
            status:
                current === this.progressBarStatus.maximum
                    ? 'finished'
                    : this.progressBarStatus.status,
        });
        if (current === this.progressBarStatus.maximum) {
            setTimeout(() => {
                if (
                    this.progressBarStatus.current ===
                    this.progressBarStatus.maximum
                ) {
                    this.resetProgressBar();
                }
            }, 1000);
        }
    }

    public resetProgressBar() {
        this.setNewStatus({
            current: 0,
            maximum: 0,
            status: 'starting',
        });
    }
}

export interface ProgressBarStatus {
    readonly maximum: number;
    readonly current: number;
    /**
     * Status of progress bar used when rendering
     */
    readonly status: 'finished' | 'starting' | 'waiting';
}
