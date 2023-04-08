import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    Input,
    ChangeDetectionStrategy,
    Output,
} from '@angular/core';
import type {
    ColumnOrderPreference,
    ColumnOrdersPreference,
} from '@cache-server/api/roles/role';
import type { Table } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { isEqual } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { openColumnOrdersPreferenceManagerModal } from '../column-orders-preference-manager-modal/open-column-orders-preference-manager-modal';

@Component({
    selector: 'app-column-order-preference-selector',
    templateUrl: './column-order-preference-selector.component.html',
    styleUrls: ['./column-order-preference-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnOrderPreferenceSelectorComponent
    implements OnChanges, OnInit, Destroyed, OnDestroy
{
    @Input() projectId!: UUID;
    @Input() tableId!: UUID;
    /**
     * Wether the user should also be able to edit the columnOrders
     */
    @Input() editingEnabled!: boolean;
    /**
     * If the specified name equals one of the available columnOrders, this columnOrder is automatically selected
     */
    @Input() preferenceName?: string;
    /**
     * Emits the selected columnOrder
     * - it is guaranteed that one is emitted
     */
    @Output() readonly columnOrderChanges = new EventEmitter<
        ReadonlyArray<MetaAttribute | UUID>
    >();

    readonly destroyed = new Subject();
    public columnOrdersPreference?: ColumnOrdersPreference;
    public selectedColumnOrderPreference?: ColumnOrderPreference;

    constructor(
        private readonly rolesService: RolesService,
        private readonly modalService: BsModalService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        errors.assert(!changes.projectId || changes.projectId.isFirstChange());
        errors.assert(!changes.tableId || changes.tableId.isFirstChange());
        if (changes.preferenceName) {
            const newColumnOrderPreference = this.columnOrdersPreference?.find(
                (columnOrderPreference) =>
                    columnOrderPreference.name === this.preferenceName
            );
            if (newColumnOrderPreference) {
                this.selectColumnOrder(newColumnOrderPreference);
            }
        }
    }

    ngOnInit() {
        combineLatest([
            this.tablesService.getTable(this.projectId, this.tableId),
            this.rolesService.getRole(this.projectId),
        ])
            .pipe(takeUntil(this.destroyed))
            .subscribe(([table, role]) => {
                this.columnOrdersPreference = this.repairColumnOrdersPreference(
                    role.preferences.columnOrders[this.tableId],
                    table
                );
                if (this.selectedColumnOrderPreference) {
                    const newSelectedColumnOrderPreference =
                        this.columnOrdersPreference?.find(
                            (columnOrderPreference) =>
                                columnOrderPreference.name ===
                                this.selectedColumnOrderPreference!.name
                        );
                    if (newSelectedColumnOrderPreference) {
                        this.selectColumnOrder(
                            newSelectedColumnOrderPreference
                        );
                        this.changeDetectorRef.markForCheck();
                        return;
                    }
                }
                const firstColumnOrderPreference =
                    this.columnOrdersPreference?.[0] ??
                    this.getDefaultColumnOrdersPreference(table);
                this.selectColumnOrder(firstColumnOrderPreference);
                this.changeDetectorRef.markForCheck();
            });
    }

    public selectColumnOrder(columnOrderPreference: ColumnOrderPreference) {
        if (
            isEqual(columnOrderPreference, this.selectedColumnOrderPreference)
        ) {
            return;
        }
        this.selectedColumnOrderPreference = columnOrderPreference;
        this.columnOrderChanges.emit(columnOrderPreference.attributeOrder);
    }

    private getDefaultColumnOrdersPreference(
        table: Table
    ): ColumnOrderPreference {
        return {
            attributeOrder: table.attributes.map((attribute) => attribute.id),
            name: `All attributes`, // TODO: translate
        };
    }

    public repairColumnOrdersPreference(
        columnOrdersPreference: ColumnOrdersPreference | undefined,
        table: Table
    ) {
        return columnOrdersPreference?.map((columnsPreference) => ({
            ...columnsPreference,
            attributeOrder: columnsPreference.attributeOrder.filter(
                (column) =>
                    metaAttributes.includes(column as MetaAttribute) ||
                    table.attributes.some(
                        (attribute) => attribute.id === column
                    )
            ),
        }));
    }

    public openColumnOrdersPreferenceManagerModal() {
        openColumnOrdersPreferenceManagerModal(
            this.modalService,
            this.tableId,
            this.projectId
        );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
