import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import { IntermediateTable } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { Version } from '@cache-server/api/versions/version';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-foreign-many-item-changes',
    templateUrl: './foreign-many-item-changes.component.html',
    styleUrls: ['./foreign-many-item-changes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays the changes in a single relation of a foreign-many relation
 * (foreign-many-item-card with a table with the changes in it)
 */
export class ForeignManyItemChangesComponent
    extends Destroyed
    implements OnDestroy, OnChanges
{
    /**
     * id of the table to which attribute belongs to (must be either the 'first' or 'second' table of the intermediateTable)
     */
    @Input() tableId!: UUID;
    /**
     * the attribute to which the relations connect
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version of the intermediateTable
     */
    @Input() intermediateVersion!: Version;
    /**
     * the intermediateTable that is connected with the attribute
     */
    @Input() intermediateTable!: IntermediateTable;

    /**
     * the previous version of the intermediateVersion for comparing changes
     * null: not loaded yet
     * undefined: there is no previous version
     * Version: the previous version
     */
    public previousIntermediateVersion?: Version | null = null;
    readonly destroyed = new Subject();

    constructor(
        private readonly versionsService: VersionsService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnChanges() {
        if (!this.intermediateVersion.deleted) {
            const previousVersionFilterGroup: FilterGroup = {
                type: 'and',
                expressions: [
                    {
                        key: 'entryId',
                        type: 'equal',
                        value: this.intermediateVersion.entryId,
                    },
                    {
                        key: 'createdAt',
                        type: 'less',
                        value: this.intermediateVersion.createdAt,
                    },
                ],
            };
            // Get the previous version
            this.versionsService
                .getVersions(
                    this.intermediateTable.projectId,
                    this.intermediateTable.id,
                    JSON.stringify(previousVersionFilterGroup),
                    undefined,
                    'createdAt',
                    'descending',
                    1
                )
                .pipe(
                    map(
                        (results) => results.versions[0] as Version | undefined
                    ),
                    takeUntil(this.destroyed)
                )
                .subscribe((previousVersion) => {
                    this.previousIntermediateVersion = previousVersion;
                    this.changeDetectorRef.markForCheck();
                });
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
