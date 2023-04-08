import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { ColumnOrderPreference } from '@cache-server/api/roles/role';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { metaAttributes } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { DeepWritable } from '@shared/utility/types/writable';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { Form } from '@shared/inputs/form';
import type { AsyncValidator } from '@shared/utility/classes/state/validator-state';
import { RolesService } from '@core/cache-client/api/roles/roles.service';

@Component({
    selector: 'app-create-column-order-preference-modal',
    templateUrl: './create-column-order-preference-modal.component.html',
    styleUrls: ['./create-column-order-preference-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateColumnOrderPreferenceModalComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    public projectId!: UUID;
    public tableId!: UUID;

    public readonly columnOrderCreated = new Subject<ColumnOrderPreference>();
    public columnOrderPreference?: DeepWritable<ColumnOrderPreference>;
    public readonly modalState = new State(undefined, () => true, [
        (v: any) =>
            !this.columnOrderPreference ||
            this.columnOrderPreference.attributeOrder.length >= 1
                ? null
                : {
                      minOrderedAttributeIds: {
                          translationKey: _(
                              'pages.tables.column-orders.create-column-order-preference-modal.min-ordered-attributes-error'
                          ),
                      },
                  },
    ]);

    public table?: Table;
    /**
     * The Ids of attributes that are currently not in the columnOrderPreference and can be added
     */
    public addableAttributeIds: ReadonlyArray<UUID> = [];

    public newColumnOrderPreferenceForm?: Form<
        readonly [StringInput],
        string | null
    >;

    private createColumnOrderForm() {
        return new Form([
            new StringInput('name', null, {
                validators: [CustomValidators.required()],
                asyncValidators: [this.uniqueValidator],
            }),
        ] as const);
    }

    private readonly uniqueValidator: AsyncValidator<string | null> = (
        newName
    ) =>
        this.rolesService.getRole(this.projectId).pipe(
            map((role) =>
                role.preferences.columnOrders[this.tableId]?.some(
                    (filterPreference) => filterPreference.name === newName
                )
                    ? {
                          unique: {
                              value: newName,
                              translationKey: _(
                                  'pages.entries.new-column-order-preference-modal.column-order-preference-name.unique-validator'
                              ),
                          },
                      }
                    : null
            )
        );

    constructor(
        private readonly tablesService: TablesService,
        private readonly rolesService: RolesService,
        public readonly bsModalRef: BsModalRef,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.tablesService
            .getTable(this.projectId, this.tableId)
            .pipe(takeUntil(this.destroyed))
            .subscribe((table) => {
                this.table = table;
                if (!this.columnOrderPreference) {
                    this.columnOrderPreference = {
                        name:
                            this.newColumnOrderPreferenceForm?.controls[0]
                                .value ?? '',
                        attributeOrder: table.attributes.map((attr) => attr.id),
                    };
                } else {
                    // remove attributIds that are no longer there
                    this.columnOrderPreference.attributeOrder =
                        this.columnOrderPreference!.attributeOrder.filter(
                            (attrId) => {
                                if (
                                    table.attributes.some(
                                        (attr) => attr.id === attrId
                                    )
                                ) {
                                    return true;
                                }
                                console.log(
                                    `Attribute ${attrId} has been removed from the view.`
                                );
                                return false;
                            }
                        );
                }
                this.generateAddableAttributeIds();
                this.changeDetectorRef.markForCheck();
            });
        // initialize here, because the modalService injects the values just before this time
        this.newColumnOrderPreferenceForm = this.createColumnOrderForm();
        this.newColumnOrderPreferenceForm.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe((value) => {
                if (!this.columnOrderPreference) {
                    return;
                }
                this.columnOrderPreference.name =
                    this.newColumnOrderPreferenceForm!.controls[0].value ?? '';
                this.changeDetectorRef.markForCheck();
            });
    }

    public addAttribute(id: UUID) {
        this.columnOrderPreference!.attributeOrder.push(id);
        this.generateAddableAttributeIds();
        this.modalState.updateState(true, true);
    }

    public removeAttribute(id: UUID) {
        this.columnOrderPreference!.attributeOrder =
            this.columnOrderPreference!.attributeOrder.filter(
                (attrId) => attrId !== id
            );
        this.generateAddableAttributeIds();
        this.modalState.updateState(true, true);
    }

    public moveAttr(event: CdkDragDrop<string[]>) {
        if (event.previousIndex !== event.currentIndex) {
            moveItemInArray(
                this.columnOrderPreference!.attributeOrder,
                event.previousIndex,
                event.currentIndex
            );
            this.modalState.updateState(true, true);
        }
    }

    public save() {
        if (
            !this.newColumnOrderPreferenceForm ||
            this.newColumnOrderPreferenceForm.invalid ||
            !this.columnOrderPreference
        ) {
            return;
        }
        this.columnOrderCreated.next(this.columnOrderPreference);
        this.bsModalRef.hide();
    }

    private generateAddableAttributeIds() {
        if (!this.table) {
            return;
        }
        this.addableAttributeIds = [
            ...this.table.attributes.map((attr) => attr.id),
            ...metaAttributes,
        ].filter(
            (id) => !this.columnOrderPreference!.attributeOrder.includes(id)
        );
    }

    ngOnDestroy() {
        this.modalState.destroy();
        this.columnOrderCreated.complete();
    }
}
