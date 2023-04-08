import type { OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { Version } from '@cache-server/api/versions/version';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { presentForeignRelationsFilter } from '@shared/versions/display-version/foreign/present-foreign-relations-filter';
import type { ChangesRow } from '../version-changes/changes-row';

@Component({
    selector: 'app-foreign-changes',
    templateUrl: './foreign-changes.component.html',
    styleUrls: ['./foreign-changes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays a list of all relations on an foreignAttribute that were present with version
 * changes are marked
 */
export class ForeignChangesComponent extends Destroyed implements OnDestroy {
    /**
     * wether only changed foreign relations should be shown or all relations that were present on version
     */
    @Input() showUnchanged!: boolean;
    /**
     * Wether hidden attributes should be shown
     */
    @Input() showHidden = false;
    /**
     * the attribute to which the relations connect
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version from that all (changed) relations should be displayed
     */
    @Input() version!: Version;
    /**
     * Emits as soon as possible whether this attribute has changed
     */
    @Output() readonly rowStatus = new EventEmitter<ChangesRow['status']>();

    /**
     * returns the filter to retrieve all changed relations
     */
    public readonly getChangedRelationsFilter = (
        ownAttributeId: UUID,
        version: Version
    ): FilterGroup => {
        if (!version.updateId) {
            errors.error({
                message: `the version ${version.id} is expected to have an updateId (because else no foreign changes would have been made) but does not have one.`,
            });
        }
        return {
            type: 'and',
            expressions: [
                {
                    key: ownAttributeId,
                    type: 'equal',
                    value: version.entryId,
                },
                {
                    key: 'updateId',
                    type: 'equal',
                    // The version is expected to have an updatedId
                    value: version.updateId!,
                },
            ],
        };
    };

    /**
     * returns the filter to retrieve all changed and unchanged relations
     */
    public readonly getChangedAndUnchangedRelationsFilter = (
        ownAttributeId: UUID,
        version: Version
    ): FilterGroup => {
        if (!version.updateId) {
            return presentForeignRelationsFilter(ownAttributeId, version);
        }
        return {
            type: 'or',
            expressions: [
                this.getChangedRelationsFilter(ownAttributeId, version),
                presentForeignRelationsFilter(ownAttributeId, version),
            ],
        };
    };

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
