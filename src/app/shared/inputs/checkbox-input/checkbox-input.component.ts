import type { OnChanges, OnDestroy } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SpecialInputComponent } from '../shared/special-input-component';
import { CheckboxInput } from './checkbox-input';

@Component({
    selector: 'app-checkbox-input',
    templateUrl: './checkbox-input.component.html',
    styleUrls: ['./checkbox-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxInputComponent
    extends SpecialInputComponent
    implements OnChanges, OnDestroy
{
    @Input() control!: CheckboxInput;
    /**
     *  whether to show switch or actual checkbox
     */
    @Input() switch = true;
}
