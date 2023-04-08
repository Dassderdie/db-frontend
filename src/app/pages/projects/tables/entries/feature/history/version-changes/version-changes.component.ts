import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Input,
} from '@angular/core';
import type {
    Attribute,
    ForeignAttribute,
} from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { Version } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { isForeignSingleAttribute } from '@shared/pipes/attribute/is-foreign-single-attribute';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { isEqual } from 'lodash-es';
import { combineLatest, merge, of, Subject } from 'rxjs';
import { filter, switchMap, map, takeUntil } from 'rxjs/operators';
import type { ChangesRow } from './changes-row';

@Component({
    selector: 'app-version-changes',
    templateUrl: './version-changes.component.html',
    styleUrls: ['./version-changes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays the changes between a version and its predecessor in a neat table
 */
export class VersionChangesComponent
    extends Destroyed
    implements OnChanges, OnDestroy
{
    /**
     * the current version
     */
    @Input() currentVersion!: Version;
    /**
     * the previous version
     * (it must be the previous else the displayed changes for foreign-attributes could be very wrong)
     */
    @Input() oldVersion?: Version;
    /**
     * the attributes that should be displayed
     */
    @Input() attributes!: ReadonlyArray<Attribute>;
    /**
     * Wether hidden attributes should be shown
     */
    @Input() showHidden = false;

    /**
     * wether also unchanged attributes and relations should be shown
     */
    public showUnchanged = false;
    /**
     *  whether all attributes have changes and showUnchanged is therefore deactivated
     */
    public allChanged = true;
    /**
     * the rows of the table visualizing the changes (each row represents one attribute)
     */
    public rows: ReadonlyArray<ChangesRow> = [];
    private readonly currentVersionChanges = new Subject<unknown>();

    constructor(
        private readonly versionsService: VersionsService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (
            changes.attributes ||
            changes.currentVersion ||
            changes.oldVersion
        ) {
            this.currentVersionChanges.next(undefined);
            this.setRows(
                this.attributes.map((attribute) => {
                    let status: ChangesRow['status'];
                    const current = this.currentVersion.values[attribute.id]!;
                    errors.assert(current !== undefined);
                    const old = this.oldVersion?.values[attribute.id];
                    if (attribute.kind === 'files') {
                        // it is only important wether the row is unchanged or not
                        status = isEqual(old, current) ? 'unchanged' : 'new';
                    } else if (attribute.kind === 'foreign') {
                        status = this.currentVersion.updateId
                            ? // Foreign rows are shown as changed on init, the then initialised component evaluates wether changes were made
                              // and updates the status through an event
                              // TODO: directly save in the foreign values which foreign attributes were changed
                              'changed'
                            : 'unchanged';
                    } else {
                        status = !old
                            ? 'new'
                            : isEqual(old, current)
                            ? 'unchanged'
                            : old === null || old === undefined
                            ? 'new'
                            : current === null
                            ? 'deleted'
                            : 'changed';
                    }
                    return {
                        attribute,
                        status,
                    };
                })
            );
            // perform side effects afterwards to make sure this.rows is defined
            this.attributes.forEach((attribute) => {
                if (isForeignSingleAttribute(attribute)) {
                    // single foreign is updated asynchronously
                    this.setForeignSingleStatus(attribute);
                }
            });
        }
    }

    public updateForeignAttributeStatus(
        attribute: Attribute,
        newStatus: ChangesRow['status']
    ) {
        const rowIndex = this.rows.findIndex(
            (row) => row.attribute.id === attribute.id
        );
        const oldRow = this.rows[rowIndex];
        errors.assert(!!oldRow);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const newRow = {
            ...oldRow,
            status: newStatus,
        } as ChangesRow;
        const newRows = [...this.rows];
        newRows[rowIndex] = newRow;
        this.setRows(newRows);
        this.changeDetectorRef.markForCheck();
    }

    public toggleShowUnchanged() {
        if (this.allChanged) {
            return;
        }
        this.showUnchanged = !this.showUnchanged;
    }

    private setRows(rows: ReadonlyArray<ChangesRow>) {
        this.rows = rows;
        this.allChanged = !this.rows.some((row) => row.status === 'unchanged');
    }

    /**
     * Asynchronously sets the status of the row for the specified foreign attribute to the correct status
     */
    private setForeignSingleStatus(attribute: ForeignAttribute) {
        this.getCurrentIntermediateVersions(attribute)
            .pipe(
                filter((intermediateResults) => {
                    if (intermediateResults.totalVersionCount > 1) {
                        // The value must have been changed
                        // Because it could be possible to create the new relation first
                        // And delete the other one later, createdAt isn't adequate to determine changes etc.
                        this.updateForeignAttributeStatus(attribute, 'changed');
                        return false;
                    }
                    if (!intermediateResults.versions[0] || !this.oldVersion) {
                        // The value of another foreign attribute must have been updated with this updateId
                        this.updateForeignAttributeStatus(
                            attribute,
                            'unchanged'
                        );
                        return false;
                    }
                    return true;
                }),
                switchMap((intermediateResults) => {
                    const currentForeignVersion =
                        intermediateResults.versions[0]!;
                    return combineLatest([
                        of(currentForeignVersion),
                        this.versionsService
                            .getVersions(
                                // because of filter
                                this.oldVersion!.projectId,
                                attribute.kindOptions.intermediateTableId,
                                JSON.stringify(
                                    this.getPreviousVersionFilter(
                                        currentForeignVersion.entryId,
                                        currentForeignVersion.createdAt
                                    )
                                ),
                                undefined,
                                'createdAt',
                                'descending',
                                1
                            )
                            .pipe(
                                map(
                                    (previousForeignResults) =>
                                        previousForeignResults.versions[0] as
                                            | Version
                                            | undefined
                                )
                            ),
                    ]);
                }),
                takeUntil(this.destroyed)
            )
            .subscribe(([currentForeignVersion, previousForeignVersion]) => {
                this.updateForeignAttributeStatus(
                    attribute,
                    currentForeignVersion && !currentForeignVersion.deleted
                        ? previousForeignVersion &&
                          !previousForeignVersion.deleted &&
                          this.oldVersion
                            ? 'changed'
                            : 'new'
                        : previousForeignVersion &&
                          !previousForeignVersion.deleted
                        ? 'deleted'
                        : 'unchanged'
                );
            });
    }

    /**
     * @returns the intermediateVersions of the specified attribute that belong to the current-version
     */
    private getCurrentIntermediateVersions(attribute: ForeignAttribute) {
        return this.tablesService
            .getTable<IntermediateTable>(
                this.currentVersion.projectId,
                attribute.kindOptions.intermediateTableId
            )
            .pipe(
                switchMap((intermediateTable) => {
                    const ownAttributeId = getForeignEntryAttributeIds(
                        intermediateTable,
                        this.currentVersion.tableId,
                        attribute.id
                    ).entryAttributeId;
                    // Get the intermediateVersions with the updateId of this change
                    return this.versionsService.getVersions(
                        this.currentVersion.projectId,
                        attribute.kindOptions.intermediateTableId,
                        JSON.stringify(
                            this.getIntermediateCurrentVersionFilter(
                                ownAttributeId
                            )
                        )
                    );
                }),
                takeUntil(merge(this.destroyed, this.currentVersionChanges))
            );
    }

    /**
     * @param attributeId of the foreign attribute
     * @returns the filter for all the intermediate versions that belong to the specified foreign-attribute and
     */
    private getIntermediateCurrentVersionFilter(
        attributeId: UUID
    ): FilterGroup {
        return {
            type: 'and',
            expressions: [
                {
                    key: attributeId,
                    type: 'equal',
                    value: this.currentVersion.entryId,
                },
                {
                    key: 'updateId',
                    type: 'equal',
                    value: this.currentVersion.updateId!,
                },
            ],
        };
    }

    /**
     * @param entryId of the currentVersion
     * @param createdAt of the currentVersion
     */
    private getPreviousVersionFilter(
        entryId: UUID,
        createdAt: string
    ): FilterGroup {
        return {
            type: 'and',
            expressions: [
                {
                    key: 'entryId',
                    type: 'equal',
                    value: entryId,
                },
                {
                    key: 'createdAt',
                    type: 'less',
                    value: createdAt,
                },
            ],
        };
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
