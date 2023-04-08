import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { Attribute } from '@cache-server/api/tables/attribute';
import { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { Form } from '@shared/inputs/form';
import type { CustomInput } from '@shared/inputs/input/input';
import { State } from '@shared/utility/classes/state/state';

@Component({
    selector: 'app-attribute-input',
    templateUrl: './attribute-input.component.html',
    styleUrls: ['./attribute-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeInputComponent {
    @Input() projectId!: UUID;
    @Input() tableId!: UUID;
    /**
     * the version whose values should be changed
     * the changed status will only be shown if the initialVersion is specified
     */
    @Input() initialVersion?: Version;
    @Input() autofocusId?: UUID;
    @Input() attribute!: Attribute;
    @Input() value?: InputsValues[UUID];
    @Input() form!: Form<readonly CustomInput[]>;
    @Input() disabled!: boolean;
    /**
     * the state of the parent component
     */
    @Input() inputsState!: State;
    @Output() readonly valueChanges = new EventEmitter<InputsValues[UUID]>();
}
