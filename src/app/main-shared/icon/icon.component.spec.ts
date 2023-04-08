import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [IconComponent, TestHostComponent],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
    });

    @Component({
        selector: 'app-host-component',
        template: ' <app-icon type="settings"></app-icon> ',
    })
    class TestHostComponent {}
});
