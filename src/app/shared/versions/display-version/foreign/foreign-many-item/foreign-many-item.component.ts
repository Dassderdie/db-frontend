import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import { IntermediateTable } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-foreign-many-item',
    templateUrl: './foreign-many-item.component.html',
    styleUrls: ['./foreign-many-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays an overview of a single relation of a foreign-many relation
 */
export class ForeignManyItemComponent {
    /**
     * id of the table to which attribute belongs to (must be either the 'first' or 'second' table of the intermediateTable)
     */
    @Input() tableId!: UUID;
    /**
     * the attribute to which the relations connect
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version of the intermediateTable whose information will be displayed in a table in this card
     */
    @Input() intermediateVersion!: Version;
    /**
     * the intermediateTable that is connected with the attribute
     */
    @Input() intermediateTable!: IntermediateTable;
    /**
     * Wether hidden attributes should be shown
     */
    @Input() showHidden = false;
}
