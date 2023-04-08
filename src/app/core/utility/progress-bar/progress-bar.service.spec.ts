import { TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import type { ProgressBarStatus } from './progress-bar.service';
import { ProgressBarService } from './progress-bar.service';

describe('ProgressBarService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProgressBarService],
        });
    });

    it('should be created', inject(
        [ProgressBarService],
        (service: ProgressBarService) => {
            expect(service).toBeTruthy();
        }
    ));

    it('should higher the maximum', inject(
        [ProgressBarService],
        (service: ProgressBarService) => {
            expect(getProgressStatus(service).maximum).toEqual(0);

            service.addTask();
            expect(getProgressStatus(service).maximum).toEqual(1);
            expect(getProgressStatus(service).current).toEqual(0);
        }
    ));

    it('should higher maximum and current', inject(
        [ProgressBarService],
        fakeAsync((service: ProgressBarService) => {
            expect(getProgressStatus(service).maximum).toEqual(0);
            expect(getProgressStatus(service).current).toEqual(0);

            for (let i = 0; i < 10; i++) {
                service.addTask();
                expect(getProgressStatus(service).maximum).toEqual(i + 1);
            }

            for (let i = 0; i < 10; i++) {
                service.resolveTask();
                expect(getProgressStatus(service).current).toEqual(i + 1);
                expect(getProgressStatus(service).maximum).toEqual(10);
            }
            tick(1000);
        })
    ));

    it('should reset progress after timeout', inject(
        [ProgressBarService],
        fakeAsync((service: ProgressBarService) => {
            expect(getProgressStatus(service).maximum).toEqual(0);
            expect(getProgressStatus(service).current).toEqual(0);

            for (let i = 0; i < 10; i++) {
                service.addTask();
            }

            for (let i = 0; i < 10; i++) {
                service.resolveTask();
            }
            expect(getProgressStatus(service).current).toEqual(10);
            expect(getProgressStatus(service).maximum).toEqual(10);

            tick(999);
            expect(getProgressStatus(service).current).toEqual(10);
            expect(getProgressStatus(service).maximum).toEqual(10);

            tick(1);
            expect(getProgressStatus(service).current).toEqual(0);
            expect(getProgressStatus(service).maximum).toEqual(0);
        })
    ));

    it('should not reset progress if a new task got added during timeout', inject(
        [ProgressBarService],
        fakeAsync((service: ProgressBarService) => {
            expect(getProgressStatus(service).maximum).toEqual(0);
            expect(getProgressStatus(service).current).toEqual(0);
            expect(getProgressStatus(service).status).toEqual('starting');

            for (let i = 0; i < 10; i++) {
                service.addTask();
            }
            expect(getProgressStatus(service).status).toEqual('starting');
            tick(0);
            expect(getProgressStatus(service).status).toEqual('waiting');

            for (let i = 0; i < 10; i++) {
                service.resolveTask();
            }
            tick(0);
            expect(getProgressStatus(service).status).toEqual('finished');
            expect(getProgressStatus(service).current).toEqual(10);
            expect(getProgressStatus(service).maximum).toEqual(10);

            tick(999);
            service.addTask();
            tick(1);
            expect(getProgressStatus(service).current).toEqual(10);
            expect(getProgressStatus(service).maximum).toEqual(11);

            service.resolveTask();
            expect(getProgressStatus(service).current).toEqual(11);
            expect(getProgressStatus(service).maximum).toEqual(11);

            tick(1000);
            expect(getProgressStatus(service).current).toEqual(0);
            expect(getProgressStatus(service).maximum).toEqual(0);
        })
    ));
});

function getProgressStatus(progressBarService: ProgressBarService) {
    return (progressBarService as any).progressBarStatus as ProgressBarStatus;
}
