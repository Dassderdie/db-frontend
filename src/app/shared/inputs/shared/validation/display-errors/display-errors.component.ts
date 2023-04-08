import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { StateErrors } from '@shared/utility/classes/state/state-error';

@Component({
    selector: 'app-display-errors',
    templateUrl: './display-errors.component.html',
    styleUrls: ['./display-errors.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayErrorsComponent {
    @Input() errors!: StateErrors<any>;
    @Input() pending!: boolean;
}
