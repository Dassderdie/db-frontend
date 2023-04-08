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
import type { Version } from '@cache-server/api/versions/version';
import { EditEntriesService } from '@core/cache-client/api/edit-entries/edit-entries.service';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { DeactivationDirective } from '@core/guards/deactivation/deactivation';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { getEntryRouteParams } from '@entries/get-entry-route-params';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import { editTableView } from '@tables/shared/table-views/table-view-editor-modal/edit-table-view';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import type { Role } from '@cache-server/api/roles/role';
import { Subject, combineLatest } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-edit-entry',
    templateUrl: './edit-entry.component.html',
    styleUrls: ['./edit-entry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEntryComponent
    extends DeactivationDirective
    implements OnDestroy, OnInit, Destroyed, Destroyed
{
    // To use it in template
    public readonly breakpoints = Breakpoints;
    readonly destroyed = new Subject();
    public table?: Table;
    public project?: Project;
    public initialVersion?: Version;
    public entryEditing?: Promise<unknown>;
    public entryDeleting?: Promise<Version>;
    public entryState = new State();
    public changedEntryValues: InputsValues = {};
    public tableViews?: Role['preferences']['tableViews'];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly confirmationModalService: ConfirmationModalService,
        private readonly tables: TablesService,
        private readonly rolesService: RolesService,
        private readonly messages: MessageService,
        private readonly versionsApi: VersionsService,
        private readonly editEntriesApi: EditEntriesService,
        private readonly router: Router,
        private readonly projects: ProjectsService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly bsModalService: BsModalService
    ) {
        super(confirmationModalService);
        this.addDeactivationGuard(() => this.entryState.changed);
    }

    ngOnInit() {
        const params$ = getEntryRouteParams(this.activatedRoute);
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.projects.getProject(projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((project) => {
                this.project = project;
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
        params$
            .pipe(
                switchMap(({ projectId, tableId, entryId }) =>
                    combineLatest([
                        this.versionsApi.getNewestVersion(
                            projectId,
                            tableId,
                            entryId
                        ),
                        this.tables.getTable(projectId, tableId),
                    ])
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(([newestVersion, table]) => {
                if (!newestVersion) {
                    errors.error({
                        message: `There is no such entry`,
                        logValues: window.location.href,
                    });
                }
                this.table = table;
                this.initialVersion = newestVersion;
                this.changeDetectorRef.markForCheck();
            });
    }

    public submit(anonymous: boolean) {
        if (!this.initialVersion) {
            errors.error();
            return;
        }
        this.entryEditing = this.editEntriesApi
            .processInputsValues(
                this.initialVersion.projectId,
                this.initialVersion.tableId,
                this.changedEntryValues,
                anonymous,
                this.initialVersion.entryId
            )
            .then(async () => {
                this.messages.postMessage({
                    color: 'success',
                    title: _('pages.entries.edit.edit-success-message.title'),
                    body: _('pages.entries.edit.edit-success-message.body'),
                });
                // To pass deactivationGuard
                this.entryState.changed = false;
                this.changeDetectorRef.markForCheck();
                await this.router.navigate(['..', 'overview'], {
                    relativeTo: this.activatedRoute,
                });
            })
            .catch((error) => errors.error({ error }));
    }

    public deleteEntry(anonymous: boolean) {
        this.confirmationModalService
            .confirm({
                title: _('pages.entries.edit.delete.title'),
                description: _('pages.entries.edit.delete.description'),
                btnOkText: _('pages.entries.edit.delete.ok'),
                kind: 'danger',
            })
            .then((confirmed) => {
                if (!confirmed) {
                    return;
                }
                errors.assert(!!this.initialVersion);
                this.entryDeleting = this.editEntriesApi
                    .deleteEntry(
                        this.initialVersion.projectId,
                        this.initialVersion.tableId,
                        this.initialVersion.entryId,
                        anonymous,
                        null,
                        true,
                        this.initialVersion.values
                    )
                    .then((v) => {
                        this.messages.postMessage({
                            color: 'success',
                            title: _(
                                'pages.entries.edit.delete-success-message.title'
                            ),
                            body: _(
                                'pages.entries.edit.delete-success-message.body'
                            ),
                        });
                        // To pass deactivationGuard
                        this.entryState.changed = false;
                        this.changeDetectorRef.markForCheck();
                        this.router.navigate(['..'], {
                            relativeTo: this.activatedRoute,
                        });
                        return v;
                    });
            });
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
