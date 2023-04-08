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
import { Version } from '@cache-server/api/versions/version';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { State } from '@shared/utility/classes/state/state';
import { getForeignEntryId } from '@shared/utility/functions/get-foreign-entry-id';
import { EditForeignEntry } from '../foreign-input-value';
import type { RemoveRelationArguments } from './remove-relation-arguments';
import type { UpdateValueArguments } from './update-value-arguments';

@Component({
    selector: 'app-foreign-many-relation-input',
    templateUrl: './foreign-many-relation-input.component.html',
    styleUrls: ['./foreign-many-relation-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays an input for an already created intermediateEntry
 */
export class ForeignManyRelationInputComponent {
    /**
     * the state of the parent foreign-many-input
     */
    @Input() foreignState!: State;
    /**
     * the id of the table to which the foreign-attribute belongs to
     */
    @Input() tableId!: UUID;
    /**
     * the foreign-attribute of whose value this relation is a part
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the (newest) Version which should be edited with this input
     */
    @Input() intermediateVersion!: Version;
    /**
     * the current value of this input
     */
    @Input() value?: EditForeignEntry;
    /**
     * the intermediateTable to which the intermediateVersion belongs
     */
    @Input() intermediateTable!: IntermediateTable;
    /**
     * wether this foreign-many-item should be disabled
     */
    @Input() disabled = false;
    /**
     * emits when the relation should be removed
     */
    @Output()
    readonly removeRelation = new EventEmitter<RemoveRelationArguments>();
    /**
     * emits the intermediateEntryId when the relation should be restored
     */
    @Output() readonly restoreRelation = new EventEmitter<UUID>();
    /**
     * always emits when the value of the relation updates
     */
    @Output() readonly updateValue = new EventEmitter<UpdateValueArguments>();

    // To use it in template
    public breakpoints = Breakpoints;

    /**
     * @returns the foreignEntryId of this foreign many relation
     */
    public getForeignEntryIdOfThisItem() {
        return getForeignEntryId(
            this.intermediateVersion.values,
            true,
            this.intermediateTable,
            this.tableId,
            this.attribute.id
        );
    }
}
