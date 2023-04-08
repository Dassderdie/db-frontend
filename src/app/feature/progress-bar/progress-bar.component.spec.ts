import type { ComponentFixture } from '@angular/core/testing';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ProgressBarService } from '@core/utility/progress-bar/progress-bar.service';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
    let component: ProgressBarComponent;
    let fixture: ComponentFixture<ProgressBarComponent>;

    let service: ProgressBarService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ProgressBarComponent],
                providers: [ProgressBarService],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ProgressBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        service = fixture.debugElement.injector.get(ProgressBarService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not be shown at beginning', () => {
        expect(
            fixture.nativeElement.querySelectorAll('.progress').length
        ).toEqual(0);
    });

    it('should show and hide progress-bar', fakeAsync(() => {
        for (let i = 0; i < 2; i++) {
            service.addTask();
            fixture.detectChanges();
            expect(
                fixture.nativeElement.querySelectorAll('.progress-bar').length
            ).toEqual(1);
        }

        for (let i = 0; i < 2; i++) {
            service.resolveTask();
            fixture.detectChanges();
            expect(
                fixture.nativeElement.querySelectorAll('.progress-bar').length
            ).toEqual(1);
        }

        tick(1000);

        fixture.detectChanges();
        expect(
            fixture.nativeElement.querySelectorAll('.progress-bar').length
        ).toEqual(0);
    }));
});
