import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Project } from '@cache-server/api/projects/project';
import type { Table } from '@cache-server/api/tables/table';
import { EditEntriesService } from '@core/cache-client/api/edit-entries/edit-entries.service';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import { CopyEntryService } from '@tables/core/copy-entry.service';
import { combineLatest, Subject } from 'rxjs';
import {
    filter,
    first,
    map,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { editTableView } from '@tables/shared/table-views/table-view-editor-modal/edit-table-view';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import type { Role } from '@cache-server/api/roles/role';
import type { EntryOverviewQueryParams } from '@entries/pages/entry-overview/entry-overview-query-params';
import { copyEntryKey } from './copy-entry-key';

@Component({
    selector: 'app-create-entry',
    templateUrl: './create-entry.component.html',
    styleUrls: ['./create-entry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEntryComponent
    extends DeactivationDirective
    implements OnDestroy, OnInit, Destroyed
{
    readonly destroyed = new Subject();

    public table?: Table;
    public project?: Project;
    public entryCreation?: Promise<void>;
    public entryState = new State();
    /**
     * undefined when still waiting for the info wether an entry should be pasted here to create a similar one (copyEntry)
     */
    public changedEntryValues?: InputsValues;
    public tableViews?: Role['preferences']['tableViews'];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        private readonly rolesService: RolesService,
        private readonly editEntriesService: EditEntriesService,
        private readonly router: Router,
        private readonly projectsService: ProjectsService,
        private readonly messageService: MessageService,
        private readonly copyEntryService: CopyEntryService,
        private readonly bsModalService: BsModalService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        confirmationModalService: ConfirmationModalService
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => this.entryState.changed);
    }

    ngOnInit() {
        if (!this.activatedRoute.parent) {
            errors.error({ message: 'Parent is not defined' });
            return;
        }
        const params$ = this.activatedRoute.parent.params.pipe(
            map((params) => ({
                projectId: params.project,
                tableId: params.table,
            }))
        );
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.projectsService.getProject(projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((project) => {
                this.project = project;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId, tableId }) =>
                    this.tablesService.getTable(projectId, tableId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.rolesService.getRole(projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((role) => {
                this.tableViews = role.preferences.tableViews;
                this.changeDetectorRef.markForCheck();
            });
        // Process wether an entry should be pasted here to create a similar one
        combineLatest([
            params$,
            this.activatedRoute.queryParamMap.pipe(
                map((query) => query.get(copyEntryKey))
            ),
        ])
            .pipe(
                first(),
                tap(([params, entryId]) => {
                    if (!entryId) {
                        this.changedEntryValues = {};
                        this.changeDetectorRef.markForCheck();
                    }
                }),
                filter(([params, entryId]) => !!entryId),
                switchMap(([params, entryId]) =>
                    this.copyEntryService.getInputsValues(
                        entryId!,
                        params.tableId,
                        params.projectId
                    )
                ),
                // if the filter doesn't let any value through there would be an EmptyError if using first()
                take(1),
                takeUntil(this.destroyed)
            )
            .subscribe((copiedInputsValues) => {
                this.changedEntryValues ??= copiedInputsValues;
                this.changeDetectorRef.markForCheck();
            });
    }

    public submit(anonymous: boolean) {
        if (!this.table || !this.changedEntryValues) {
            errors.error({
                message: 'table or changedInputValues are undefined',
            });
            return;
        }
        this.entryCreation = this.editEntriesService
            .processInputsValues(
                this.table.projectId,
                this.table.id,
                this.changedEntryValues,
                anonymous
            )
            .then(async (createdEntry) => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _(
                        'pages.projects.tables.create-entry.create-success-message.title'
                    ),
                    body: _(
                        'pages.projects.tables.create-entry.create-success-message.body'
                    ),
                });
                // To pass deactivationGuard
                this.entryState.changed = false;
                const queryParams: EntryOverviewQueryParams = {
                    showCreateShortcut: true,
                };
                this.changeDetectorRef.markForCheck();
                await this.router.navigate(
                    ['..', 'entries', createdEntry.entryId, 'overview'],
                    {
                        relativeTo: this.activatedRoute,
                        queryParams,
                    }
                );
            })
            .catch((error) => errors.error({ error }));
    }

    public reset() {
        this.changedEntryValues = {};
        this.entryState.removeNotUpToDateChildren();
    }

    public editTableView() {
        editTableView(this.project!.id, this.table!.id, this.bsModalService);
    }

    ngOnDestroy() {
        this.entryState.destroy();
        this.destroyed.next(undefined);
    }
}
