import type { Project } from '@cache-server/api/projects/project';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import type { TablesService } from '@core/cache-client/api/tables/tables.service';
import { ReplaySubject, combineLatest, of } from 'rxjs';
import type { Observable, Subject } from 'rxjs';
import { takeUntil, map, filter, tap } from 'rxjs/operators';
import type { Version } from '@cache-server/api/versions/version';
import type { VersionsService } from '@core/cache-client/api/versions/versions.service';
import type { MessageService } from '@core/utility/messages/message.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { ScannedValue } from './scanner.component';

export class ScannedValueStorage {
    public storage: ScannedValueProjectItem[] = [];

    /**
     * Emits always when the storage changes the new storage object
     */
    public storage$ = new ReplaySubject<ScannedValueProjectItem[]>(1);

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly messageService: MessageService,
        private readonly destroyed: Subject<unknown>
    ) {}

    public addScann(scannedValue: ScannedValue): 'alreadyScanned' | 'valid' {
        let scannedProject = this.storage.find(
            (project) => scannedValue.projectId === project.projectId
        );
        if (!scannedProject) {
            scannedProject = {
                projectId: scannedValue.projectId,
                tables: [],
                projectName$: this.projectsService
                    .getProject(scannedValue.projectId)
                    .pipe(
                        map((project) => project.name),
                        takeUntil(this.destroyed)
                    ),
            };
            this.storage.push(scannedProject);
        }
        let scannedTable = scannedProject.tables.find(
            (table) => table.tableId === scannedValue.tableId
        );
        if (!scannedTable) {
            scannedTable = {
                tableId: scannedValue.tableId,
                table$: this.tablesService
                    .getTable(scannedValue.projectId, scannedValue.tableId)
                    .pipe(takeUntil(this.destroyed)),
                versions$: of([]),
                entryIds: [],
            };
            scannedProject.tables.push(scannedTable);
        }
        if (scannedTable.entryIds.includes(scannedValue.entryId)) {
            return 'alreadyScanned';
        }
        scannedTable.entryIds.push(scannedValue.entryId);
        scannedTable.versions$ = combineLatest([
            scannedTable.versions$,
            this.versionsService
                .getNewestVersion(
                    scannedValue.projectId,
                    scannedValue.tableId,
                    scannedValue.entryId
                )
                .pipe(
                    tap((version) => {
                        if (version) {
                            return;
                        }
                        this.messageService.postMessage({
                            title: _('messages.scanner.content-error.title'),
                            body: _('messages.scanner.content-error.body'),
                            color: 'danger',
                            log: {
                                scannedValue,
                            },
                        });
                    }),
                    filter((version) => !!version)
                ) as Observable<Version>,
        ]).pipe(map(([versions, version]) => [...versions, version]));
        this.storage$.next(this.storage);
        return 'valid';
    }

    clear() {
        this.storage = [];
        this.storage$.next(this.storage);
    }
}

interface ScannedValueProjectItem {
    projectId: UUID;
    projectName$: Observable<Project['name']>;
    tables: ScannedValueTableItem[];
}

interface ScannedValueTableItem {
    tableId: UUID;
    table$: Observable<Table>;
    // For virtual-scroll
    entryIds: UUID[];
    versions$: Observable<Version[]>;
}
