import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import { Version } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-entry-table',
    templateUrl: './entry-table.component.html',
    styleUrls: ['./entry-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays all values of a version in a neat table
 */
export class EntryTableComponent {
    /**
     * the version that should be displayed
     */
    @Input() version!: Version;
    /**
     * the attributes that the version has
     */
    @Input() attributes!: ReadonlyArray<Attribute>;
    /**
     * wether the head of the table should be displayed
     */
    @Input() displayHead = true;
    /**
     * Wether hidden attributes should be shown
     */
    @Input() showHidden = false;
}
