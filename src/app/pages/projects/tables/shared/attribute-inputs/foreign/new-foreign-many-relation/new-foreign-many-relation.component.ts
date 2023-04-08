import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import { IntermediateTable } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { State } from '@shared/utility/classes/state/state';
import { NewForeignEntry } from '../foreign-input-value';

@Component({
    selector: 'app-new-foreign-many-relation',
    templateUrl: './new-foreign-many-relation.component.html',
    styleUrls: ['./new-foreign-many-relation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewForeignManyRelationComponent {
    /**
     * An unique id (for the state)
     */
    @Input() id!: string;
    /**
     * the id of the project the table with the here specified attributes is in
     */
    @Input() projectId!: UUID;
    /**
     * the intermediateTable
     */
    @Input() intermediateTable!: IntermediateTable;
    /**
     * the foreign-attribute whose values this input should alter
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the NewForeignEntry which should be displayed and edited in this component
     */
    @Input() value!: NewForeignEntry;
    /**
     * the state of the parent component
     */
    @Input() parentState!: State;
    /**
     * wether all inputs should be disabled
     */
    @Input() disabled = false;
    /**
     * Emits the index of the newForeignRelations that should be removed
     */
    @Output() readonly removeNewForeignRelation = new EventEmitter<unknown>();
    /**
     * Emits the index and the updated value of the newIntermediateEntry that should be edited
     */
    @Output() readonly editNewForeignRelation = new EventEmitter<
        NewForeignEntry['changedIntermediateValues']
    >();
    // To use it in template
    public breakpoints = Breakpoints;
}
