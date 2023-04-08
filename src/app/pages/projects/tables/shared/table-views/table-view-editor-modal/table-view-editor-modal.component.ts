import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import type { Role } from '@cache-server/api/roles/role';
import type { TableView } from '@cache-server/api/roles/table-view';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-table-view-editor-modal',
    templateUrl: './table-view-editor-modal.component.html',
    styleUrls: ['./table-view-editor-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableViewEditorModalComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    // these must be set when opening the modal
    public projectId!: UUID;
    public tableId!: UUID;

    public table?: Table;
    public tableViews?: Role['preferences']['tableViews'];
    /**
     * The tableView of the table that should be edited
     */
    public initialTableView?: TableView;
    /**
     * The tableView whose properties get edited
     */
    public tableView?: DeepWritable<TableView>;
    public updatingTableViews?: Promise<unknown>;
    public tableViewEditorModalState = new State();

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly rolesService: RolesService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        combineLatest([
            this.tablesService.getTable(this.projectId, this.tableId),
            this.rolesService.getRole(this.projectId),
        ])
            .pipe(takeUntil(this.destroyed))
            .subscribe(([table, role]) => {
                this.table = table;
                this.tableViews = role.preferences.tableViews;
                this.initialTableView = this.tableViews[this.tableId] ?? {
                    orderedAttributeIds: this.table.attributes
                        .filter((attr) => !attr.hidden)
                        .map((attr) => attr.id),
                };
                this.changeDetectorRef.markForCheck();
            });
    }

    public saveTableView() {
        if (!this.tableViews || !this.tableView) {
            return;
        }
        const newTableViews = cloneDeepWritable(this.tableViews);
        newTableViews[this.tableId] = this.tableView;
        this.updatingTableViews = this.rolesService
            .editTableViews(this.projectId, newTableViews)
            .then(() => this.bsModalRef.hide());
    }

    public removeTableView() {
        if (!this.tableViews) {
            return;
        }
        const newTableViews = cloneDeepWritable(this.tableViews);
        delete newTableViews[this.tableId];
        this.updatingTableViews = this.rolesService
            .editTableViews(this.projectId, newTableViews)
            .then(() => this.bsModalRef.hide());
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.tableViewEditorModalState.destroy();
    }
}
