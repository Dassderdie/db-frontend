import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { Table } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-entry-name',
    templateUrl: './entry-name.component.html',
    styleUrls: ['./entry-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays the name of an entry
 */
export class EntryNameComponent
    extends Destroyed
    implements OnDestroy, OnChanges
{
    /**
     * there are 3 possible input possibilities
     * 1) projectId, tableId, entryId
     * -> get the entry & table and display the correct value
     */
    @Input() projectId?: UUID;
    @Input() tableId?: UUID;
    @Input() entryId?: UUID;
    /**
     * 2) table, entryId, newValue, deleted
     * -> display the value
     * (the ids could be needed for foreign relations)
     */
    @Input() newValue?: InputsValues[0] | Version['values'][''];
    @Input() deleted = false;
    /**
     * 3) newestVersion, table
     * -> display the correct value with the given newestVersion and table
     */
    @Input() newestVersion?: Version;
    @Input() table?: Table;
    /**
     * whether the entry icon and the popover should be shown
     */
    @Input() minimalistic = false;
    /**
     * Wether there should be an <a></a> link to the entry
     */
    @Input() showLink = false;

    /**
     * the current value of the newestVersion of the entry whose name should be displayed
     * undefined if still loading
     * null if an error occurred
     */
    public newestVersionValue?: Version | null;
    /**
     * the current value of the table of the entry whose name should be displayed
     */
    public tableValue?: Table;

    constructor(
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    private newestVersionValueTableSubscription?: Subscription;

    ngOnChanges() {
        this.newestVersionValueTableSubscription?.unsubscribe();
        if (this.table && this.newestVersion) {
            this.newestVersionValue = this.newestVersion;
            this.tableValue = this.table;
        } else if (this.table && this.entryId && this.newValue !== undefined) {
            this.newestVersionValue = undefined;
            this.tableValue = this.table;
        } else if (this.projectId && this.entryId && this.tableId) {
            this.newestVersionValueTableSubscription = combineLatest([
                this.versionsService.getNewestVersion(
                    this.projectId,
                    this.tableId,
                    this.entryId
                ),
                this.tablesService.getTable(this.projectId, this.tableId),
            ])
                .pipe(takeUntil(this.destroyed))
                .subscribe(
                    ([newestVersion, table]) => {
                        this.newestVersionValue = newestVersion ?? null;
                        this.tableValue = table;
                        this.changeDetectorRef.markForCheck();
                    },
                    (error: any) => {
                        this.newestVersionValue = null;
                        this.changeDetectorRef.markForCheck();
                    }
                );
        } else {
            errors.error({
                message:
                    'Either the ids or the newestVersion and table values have to be provided',
            });
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
