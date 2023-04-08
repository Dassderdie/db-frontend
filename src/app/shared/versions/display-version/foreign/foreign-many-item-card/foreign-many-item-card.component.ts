import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import { IntermediateTable } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-foreign-many-item-card',
    templateUrl: './foreign-many-item-card.component.html',
    styleUrls: ['./foreign-many-item-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays a wrapper for a foreign-relation
 * the inner elements  are projected through ng-content
 */
export class ForeignManyItemCardComponent {
    /**
     * id of the table to which attribute belongs to (must be either the 'first' or 'second' table of the intermediateTable)
     */
    @Input() tableId!: UUID;
    /**
     * the attribute to which the relations connect
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version of the intermediateTable whose information are probably displayed inside this card
     * also used to get information about the entry to which this relation connects (entry-name of foreignEntry is card-header)
     */
    @Input() intermediateVersion!: Version;
    /**
     * the intermediateTable that is connected with the attribute
     */
    @Input() intermediateTable!: IntermediateTable;
    /**
     * the card can have a status to better visualize changes in e.g. the version-history
     */
    @Input() status?: 'changed' | 'deleted' | 'new';
}
