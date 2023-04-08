import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpecialInputComponent } from '../shared/special-input-component';
import type { CustomInput } from './input';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent<
    T extends CustomInput
> extends SpecialInputComponent {
    @Input() control!: T;
}
