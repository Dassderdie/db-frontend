import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ValidatorState } from '@shared/utility/classes/state/validator-state';

@Component({
    selector: 'app-validation',
    templateUrl: './validation.component.html',
    styleUrls: ['./validation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays an alert for all error-messages of the errors of the validatorState
 */
export class ValidationComponent {
    @Input() state!: ValidatorState<any>;
    /**
     * This string with space separated classes is added to the validation container (if there are errors to show)
     */
    @Input() classes = '';
}
