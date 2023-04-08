import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { InfiniteScroll } from '@shared/utility/classes/infinite-scroll';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-add-entries-modal',
    templateUrl: './add-entries-modal.component.html',
    styleUrls: ['./add-entries-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEntriesModalComponent
    extends Destroyed
    implements OnDestroy, OnInit, AfterViewInit
{
    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly tablesService: TablesService,
        private readonly windowValuesService: WindowValuesService
    ) {
        super();
    }
    /**
     * Outputs the chosen entries
     */
    public readonly chosenEntries = new Promise<
        ReadonlyArray<Version> | undefined
    >((resolve) => {
        this._chooseEntries = resolve;
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _chooseEntries!: (
        value: ReadonlyArray<Version> | undefined
    ) => void;
    public filter!: string | null;
    public selectedVersions: ReadonlyArray<Version> = [];
    public tableId!: UUID;
    public projectId!: UUID;
    public readonly table$ = new ReplaySubject<Table>(1);
    public checkboxes: { [key: string]: boolean | undefined } = {};
    public allCheckbox?: boolean;

    /**
     * wether the AfterViewInit lifecycle hook has already been executed
     */
    public viewInit = false;
    /**
     * the user can't choose more than maxSelected entries
     */
    public maxSelected?: number | null;
    // For infinite scroll
    public readonly viewportHeight$ =
        this.windowValuesService.viewportHeight$.pipe(
            map((height) => height * 0.6)
        );
    public readonly loadMoreE$ = new Subject();
    public versions: ReadonlyArray<Version> = [];

    ngOnInit() {
        this.tablesService
            .getTable(this.projectId, this.tableId)
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.table$);
    }

    ngAfterViewInit() {
        this.viewInit = true;
    }

    public updateSelected(version: Version, value: boolean) {
        const index = this.selectedVersions.findIndex(
            (version2) => version2.entryId === version.entryId
        );
        const newSelectedVersions = [...this.selectedVersions];
        if (value) {
            errors.assert(index < 0, {
                status: 'error',
                message: 'Entry already in array',
            });
            if (
                this.maxSelected === undefined ||
                this.maxSelected === null ||
                newSelectedVersions.length < this.maxSelected
            ) {
                newSelectedVersions.push(version);
            } else {
                errors.error({
                    message: `not allowed to select more than ${this.maxSelected} entries`,
                });
            }
        } else {
            errors.assert(index >= 0, {
                status: 'error',
                message: 'Entry not in array',
            });
            newSelectedVersions.splice(index, 1);
        }
        this.allCheckbox = newSelectedVersions.length === this.versions.length;
        this.selectedVersions = newSelectedVersions;
    }

    public updateAll(value: boolean) {
        this.checkboxes = {};
        if (!value) {
            this.selectedVersions = [];
            return;
        }
        this.selectedVersions = this.versions.slice(
            0,
            this.maxSelected === undefined || this.maxSelected === null
                ? this.versions.length
                : this.maxSelected
        );
        for (const version of this.selectedVersions) {
            this.checkboxes[version.entryId] = true;
        }
    }

    public updateVersions(newVersions: ReadonlyArray<Version>) {
        this.versions = newVersions;
        const newSelectedVersions = [...this.selectedVersions];
        // Remove all selectedEntries, that are not in the versions array anymore
        for (let i = 0; i < newSelectedVersions.length; i++) {
            if (
                !this.versions.some(
                    (entry) => entry.entryId === newSelectedVersions[i]!.entryId
                )
            ) {
                delete this.checkboxes[newSelectedVersions[i]!.entryId];
                newSelectedVersions.splice(i, 1);
            }
        }
        this.allCheckbox = newSelectedVersions.length === this.versions.length;
        this.selectedVersions = newSelectedVersions;
    }

    /**
     * loads more elements with infinite scroll when the user reaches the end of scrolling
     * @param event the scroll-event
     * @param tableKey the index of the table whose values have been scrolled
     */
    public onScroll(event: any) {
        // Visible height + pixel scrolled >= total height
        if (
            event.target.offsetHeight +
                event.target.scrollTop +
                InfiniteScroll.scrollBuffer >=
            event.target.scrollHeight
        ) {
            this.loadMoreE$.next(undefined);
        }
    }

    private entriesChosen = false;
    public chooseEntries() {
        this._chooseEntries(this.selectedVersions);
        this.entriesChosen = true;
        this.bsModalRef.hide();
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.table$.complete();
        if (!this.entriesChosen) {
            this._chooseEntries(undefined);
        }
    }
}
