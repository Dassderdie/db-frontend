import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { MessageService } from '@core/utility/messages/message.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { GeneralProperties } from '@tables-editor/core/general-properties/general-properties';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';
import { hasAnAttributeBeenRemoved } from '@tables-editor/shared/has-an-attribute-been-removed';
import { Subject, combineLatest } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import type { EditableTable } from '../editable-table';
import {
    convertEditableTableToEditTable,
    convertToEditableDefaultTable,
    EditableNewTable,
    convertEditableNewTableToTable,
} from '../editable-table';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent
    extends DeactivationDirective
    implements OnDestroy, OnInit, Destroyed
{
    /**
     * the table from the server or if the table isn't created yet the default empty table, to which it should reset
     */
    public initialTable?: DeepReadonly<EditableNewTable | EditableTable>;
    /**
     * the current (changed) values of the table
     */
    public table?: EditableNewTable | EditableTable;
    public readonly tableState = new State(undefined, undefined, undefined, [
        (value) =>
            !this.table ||
            this.table.attributes.length < 1 ||
            this.table.attributes.some((attr) => attr.required && attr.unique)
                ? null
                : {
                      missingPrimaryKey: {
                          translationKey: _(
                              'validators.warning.missing-primary-key'
                          ),
                      },
                  },
        (value) =>
            this.table?.attributes.length &&
            this.table.attributes.every((attr) => attr.hidden)
                ? {
                      missingPrimaryKey: {
                          translationKey: _('validators.error.all-hidden'),
                      },
                  }
                : null,
    ]);
    public tableCreation?: Promise<unknown>;
    public generalPropertiesOpen = false;
    readonly destroyed = new Subject();
    private projectId?: UUID;

    constructor(
        private readonly tablesService: TablesService,
        private readonly messageService: MessageService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly confirmationModalService: ConfirmationModalService,
        private readonly i18nService: I18nService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => this.tableState.changed);
    }

    ngOnInit() {
        combineLatest([
            this.activatedRoute.parent!.params,
            this.activatedRoute.params,
        ])
            .pipe(
                filter((params) => {
                    this.projectId = params[0].project;
                    if (params[1].table !== 'new') {
                        this.changeDetectorRef.markForCheck();
                        return true;
                    }
                    // create a new Table
                    this.initialTable = new EditableNewTable(params[0].project);
                    this.generalPropertiesOpen = true;
                    this.resetChanges();
                    this.changeDetectorRef.markForCheck();
                    return false;
                }),
                switchMap((params) =>
                    this.tablesService.getTable(
                        params[0].project,
                        params[1].table
                    )
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                errors.assert(table.type === 'default');
                this.initialTable = convertToEditableDefaultTable(
                    cloneDeepWritable(table)
                );
                if (!this.table || this.table.id !== table.id) {
                    this.generalPropertiesOpen = false;
                    this.resetChanges();
                } else {
                    this.tableState.removeNotUpToDateChildren();
                }
                // The coordinates can be changed independently from the rest of the table values
                errors.assert(this.table?.editingType === 'edit');
                this.table = {
                    ...this.table,
                    coordinates: table.coordinates,
                };
                this.changeDetectorRef.markForCheck();
            });
    }

    public updateGeneralProperties(newValue: GeneralProperties) {
        errors.assert(!!this.table);
        // Updates all values and trigger changeDetection in e.g. getLanguage pipe
        this.table = { ...this.table, ...newValue };
    }

    public updateAttributes(newAttributes: ReadonlyArray<EditableAttribute>) {
        errors.assert(!!this.table);
        this.table = {
            ...this.table,
            attributes: newAttributes,
        };
    }

    public resetChanges() {
        // To only copy value, not references
        this.table = cloneDeepWritable(this.initialTable);
        this.tableState.removeNotUpToDateChildren();
        // The generalProperties are by default invalid, this is against the preposition of the state, that the default-value is valid
        if (this.tableState.newCreated) {
            // Open to trigger validation and therefore invalidate state
            this.generalPropertiesOpen = true;
        }
    }

    public async submitTable() {
        errors.assert(!!this.projectId && !!this.table && !!this.initialTable);
        if (
            // check wether an attribute has been removed
            hasAnAttributeBeenRemoved(
                this.table.attributes,
                this.initialTable.attributes
            ) &&
            // check wether the user really wants this
            !(await this.confirmationModalService.confirm({
                title: _('pages.tablesEditor.confirmAttributeDeletion.title'),
                description: _(
                    'pages.tablesEditor.confirmAttributeDeletion.description'
                ),
                btnOkText: _(
                    'pages.tablesEditor.confirmAttributeDeletion.btnOkText'
                ),
                kind: 'danger',
            }))
        ) {
            return;
        }

        this.tableCreation = (
            this.table.editingType === 'new'
                ? this.tablesService.createTable(
                      convertEditableNewTableToTable(this.table)
                  )
                : this.tablesService.editTable(
                      convertEditableTableToEditTable(this.table)
                  )
        ).then((newTable) => {
            if (this.table!.editingType === 'new') {
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'pages.tables-editor.create-success-message.title'
                    ),
                    body: _('pages.tables-editor.create-success-message.body'),
                });
                // To not trigger deactivation-guard
                this.tableState.changed = false;
                // If new table created: set right url
                this.router.navigate(['../', newTable.id], {
                    relativeTo: this.activatedRoute,
                });
            } else {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.tables-editor.edit-success-message.title'),
                    body: _('pages.tables-editor.edit-success-message.body'),
                });
                // If table edited: set new table-value (ids)
                // TODO: necessary? (subscription to table)
                this.initialTable = convertToEditableDefaultTable(
                    cloneDeepWritable(newTable)
                );
                this.table = cloneDeepWritable(this.initialTable);
            }
            this.changeDetectorRef.markForCheck();
        });
        // for tableCreation
        this.changeDetectorRef.markForCheck();
    }

    public async saveChangesForForeignAttribute() {
        if (this.tableState.invalid) {
            this.confirmationModalService.confirm({
                title: _('pages.tablesEditor.foreign-save-invalid.title'),
                description: _(
                    'pages.tablesEditor.foreign-save-invalid.description'
                ),
                kind: 'success',
            });
            return;
        }
        // Add modal informing that foreign attributes have to be saved
        const confirmed = await this.confirmationModalService.confirm({
            title: _('pages.tablesEditor.confirm-foreign-save.title'),
            description: _(
                'pages.tablesEditor.confirm-foreign-save.description'
            ),
            btnOkText: _('pages.tablesEditor.confirm-foreign-save.btnOkText'),
            kind: 'success',
        });
        if (confirmed) {
            this.submitTable();
        }
    }

    public async deleteTable() {
        if (this.table?.editingType === 'new' || !this.initialTable) {
            errors.error();
            return;
        }
        const tableNames = this.i18nService.getLanguage(
            this.initialTable.displayNames
        );
        const confirmed = await this.confirmationModalService.confirm({
            title: _('pages.tablesEditor.confirmDeletion.title'),
            description: _('pages.tablesEditor.confirmDeletion.description'),
            btnOkText: _('pages.tablesEditor.confirmDeletion.btnOkText'),
            kind: 'danger',
            confirmationString: tableNames?.singular
                ? tableNames.singular
                : undefined,
        });
        if (!confirmed) {
            return;
        }
        if (!this.projectId || !this.initialTable?.id) {
            errors.error();
            return;
        }
        this.tablesService
            .deleteTable(this.projectId, this.initialTable.id)
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'pages.tables-editor.delete-success-message.title'
                    ),
                    body: _('pages.tables-editor.delete-success-message.body'),
                });
                // To not trigger deactivation-guard
                this.tableState.changed = false;
                this.router.navigate(['../', 'new'], {
                    relativeTo: this.activatedRoute,
                });
            });
    }

    ngOnDestroy() {
        this.tableState.destroy();
        this.destroyed.next(undefined);
    }
}
