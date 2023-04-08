import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ViewChild,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type {
    EditFiles,
    EditValues,
} from '@cache-server/api/edit-entries/edit-values';
import type { Project } from '@cache-server/api/projects/project';
import type { Table } from '@cache-server/api/tables/table';
import { anonymousUserId } from '@cache-server/api/users/anonymous-user-id';
import type { UUID } from '@cache-server/api/uuid';
import type { AttributeFilter } from '@cache-server/api/versions/attribute-filter';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import type { Version } from '@cache-server/api/versions/version';
import { EditEntriesService } from '@core/cache-client/api/edit-entries/edit-entries.service';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { MessageService } from '@core/utility/messages/message.service';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { getEntryRouteParams } from '@entries/get-entry-route-params';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { InfiniteScroll } from '@shared/utility/classes/infinite-scroll';
import { isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-entry-history',
    templateUrl: './entry-history.component.html',
    styleUrls: ['./entry-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryHistoryComponent
    extends InfiniteScroll<Version>
    implements OnDestroy, OnInit, Destroyed
{
    @ViewChild('versionsListElement')
    versionsListElement?: ElementRef<HTMLElement>;
    readonly destroyed = new Subject();

    public table?: Table;
    public project?: Project;
    public versionRestoring?: Promise<unknown>;
    // To use it in template
    public readonly anonymousUserId = anonymousUserId;
    /**
     * key: id of a version
     * value: wether this version is visible (is in the viewport)
     */
    public isVisible: { [versionId: string]: boolean } = {};
    /**
     * Wether hidden attributes should be shown
     */
    public showHidden = false;
    public readonly versions$ = this.elements$;
    protected get loadedElementsHeight() {
        return this.versionsListElement?.nativeElement.offsetHeight ?? 0;
    }
    protected viewportHeight$ = this.windowValuesService.viewportHeight$;

    getMoreElements(after?: UUID) {
        if (!after) {
            // elements are loaded new
            this.isVisible = {};
        }
        return getEntryRouteParams(this.activatedRoute).pipe(
            switchMap((params) => {
                const versionsFilter: AttributeFilter | FilterGroup = {
                    key: 'entryId',
                    type: 'equal',
                    value: params.entryId,
                };
                return this.versionsService
                    .getVersions(
                        params.projectId,
                        params.tableId,
                        JSON.stringify(versionsFilter),
                        after,
                        'createdAt',
                        'descending'
                    )
                    .pipe(
                        map((results) => ({
                            elements: results.versions,
                            totalElementCount: results.totalVersionCount,
                        }))
                    );
            }),
            takeUntil(this.destroyed)
        );
    }

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly editEntriesService: EditEntriesService,
        private readonly projectsService: ProjectsService,
        private readonly router: Router,
        private readonly confirmationModalService: ConfirmationModalService,
        private readonly messageService: MessageService,
        private readonly windowValuesService: WindowValuesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        const routeParams$ = getEntryRouteParams(this.activatedRoute);
        routeParams$
            .pipe(
                switchMap((params) =>
                    this.projectsService.getProject(params.projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((project) => {
                this.project = project;
                this.changeDetectorRef.markForCheck();
            });
        routeParams$
            .pipe(
                switchMap((params) =>
                    this.tablesService.getTable(
                        params.projectId,
                        params.tableId
                    )
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
        this.windowValuesService.endOfWindowReached$
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.loadMoreElements());
        this.loadElementsNew();
    }

    public async restore(version: Version, anonymous: boolean) {
        const hasForeignAttribute = !!this.table!.attributes.some(
            (attr) => attr.kind === 'foreign'
        );
        const confirmed = await this.confirmationModalService.confirm({
            title: _('pages.entries.history.confirmation.title'),
            description: hasForeignAttribute
                ? _('pages.entries.history.confirmation.description-foreign')
                : _('pages.entries.history.confirmation.description'),
            btnOkText: _('pages.entries.history.confirmation.ok'),
            kind: 'warning',
        });
        if (!confirmed) {
            return;
        }
        if (!this.table || !this.elements) {
            errors.error({ message: 'table or elements are not defined' });
            return;
        }
        const changedValues: EditValues = {};
        for (const attr of this.table.attributes) {
            const presentValue = this.elements[0]!.values[attr.id];
            const oldValue = version.values[attr.id];
            if (!isEqual(presentValue, oldValue)) {
                if (
                    attr.kind === 'files' &&
                    typeof oldValue === 'object' &&
                    oldValue
                ) {
                    const filesValue: EditFiles = {};
                    for (const [fileName, oldFile] of Object.entries(
                        oldValue
                    )) {
                        filesValue[fileName] = {
                            blobId: oldFile.blobId,
                        };
                    }
                    changedValues[attr.id] = filesValue;
                } else {
                    changedValues[attr.id] = oldValue!;
                }
            }
        }
        this.versionRestoring = this.editEntriesService
            .putEntry(
                version.projectId,
                version.tableId,
                version.entryId,
                changedValues,
                anonymous,
                null
            )
            .then(() => {
                this.messageService.postMessage({
                    color: 'success',
                    title: _('pages.entries.history.restore-message.title'),
                    body: _('pages.entries.history.restore-message.body'),
                });
                this.router.navigate(['..'], {
                    relativeTo: this.activatedRoute,
                });
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
