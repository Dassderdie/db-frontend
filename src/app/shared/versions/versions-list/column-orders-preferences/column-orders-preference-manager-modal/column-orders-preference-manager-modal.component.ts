import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { Role } from '@cache-server/api/roles/role';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { MessageService } from '@core/utility/messages/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { createColumnOrderPreference } from '../create-column-order-preference-modal/create-column-order-preference';
import { EditableColumnOrdersPreferences } from '../editable-column-orders-preferences';

@Component({
    selector: 'app-column-orders-preference-manager-modal',
    templateUrl: './column-orders-preference-manager-modal.component.html',
    styleUrls: ['./column-orders-preference-manager-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnOrdersPreferenceManagerModalComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    // must be set when opening the modal
    public projectId!: UUID;
    public tableId!: UUID;

    public columnOrdersPreferences?: DeepWritable<
        Role['preferences']['columnOrders']
    >;
    public updatingColumnOrdersPreferences?: Promise<unknown>;
    private table?: Table;

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly rolesService: RolesService,
        private readonly messageService: MessageService,
        private readonly modalService: BsModalService,
        private readonly translateService: TranslateService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.rolesService
            .getRole(this.projectId)
            .pipe(takeUntil(this.destroyed))
            .subscribe((role) => {
                this.columnOrdersPreferences = cloneDeepWritable(
                    role.preferences.columnOrders
                );
                this.changeDetectorRef.markForCheck();
            });
        this.tablesService
            .getTable(this.projectId, this.tableId)
            .pipe(takeUntil(this.destroyed))
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
    }

    public async moveColumnOrderPreference(event: CdkDragDrop<string[]>) {
        if (
            event.previousIndex === event.currentIndex ||
            !this.columnOrdersPreferences
        ) {
            return;
        }
        await this.updatingColumnOrdersPreferences;
        this.columnOrdersPreferences =
            EditableColumnOrdersPreferences.moveColumnOrderPreference(
                this.columnOrdersPreferences,
                this.tableId,
                event.previousIndex,
                event.currentIndex
            );
        this.save();
    }

    public async removeColumnOrderPreference(name: string) {
        if (!this.columnOrdersPreferences) {
            return;
        }
        await this.updatingColumnOrdersPreferences;
        this.columnOrdersPreferences =
            EditableColumnOrdersPreferences.removeColumnOrderPreference(
                this.columnOrdersPreferences,
                this.tableId,
                name
            );
        this.save();
    }

    public async addColumnOrderPreference() {
        await this.updatingColumnOrdersPreferences;
        const newColumnOrderPreference = await createColumnOrderPreference(
            this.modalService,
            this.tableId,
            this.projectId
        );
        if (
            newColumnOrderPreference &&
            this.columnOrdersPreferences &&
            this.table
        ) {
            this.columnOrdersPreferences =
                await EditableColumnOrdersPreferences.addColumnOrderPreference(
                    this.columnOrdersPreferences,
                    cloneDeepWritable(newColumnOrderPreference),
                    this.table,
                    this.translateService
                );
        }
        this.save();
    }

    private save() {
        if (!this.columnOrdersPreferences || !this.table) {
            return;
        }
        if (this.columnOrdersPreferences[this.tableId]) {
            // repair if necessary (remove deleted attributes)
            this.columnOrdersPreferences![this.tableId] =
                EditableColumnOrdersPreferences.repairColumnOrdersPreference(
                    this.columnOrdersPreferences![this.tableId]!,
                    this.table,
                    this.messageService
                )!;
        }
        this.updatingColumnOrdersPreferences =
            this.rolesService.editColumnOrdersPreferences(
                this.projectId,
                this.columnOrdersPreferences
            );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
