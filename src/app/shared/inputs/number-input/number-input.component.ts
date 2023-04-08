import type { TemplateRef } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SpecialInputComponent } from '../shared/special-input-component';
import { NumberInput } from './number-input';

@Component({
    selector: 'app-number-input',
    templateUrl: './number-input.component.html',
    styleUrls: ['./number-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputComponent extends SpecialInputComponent {
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: NumberInput;
}
