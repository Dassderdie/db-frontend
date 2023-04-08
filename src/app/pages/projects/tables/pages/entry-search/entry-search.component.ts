import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Table } from '@cache-server/api/tables/table';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { ShareService } from '@core/utility/share/share.service';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { openFilterPreferencesManagerModal } from '@tables/shared/search-versions/filter-preferences-manager-modal/open-filter-preferences-manager';
import { BsModalService } from 'ngx-bootstrap/modal';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-entry-search',
    templateUrl: './entry-search.component.html',
    styleUrls: ['./entry-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrySearchComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    public table?: Table;
    public filter?: string | null;
    public fullscreenTable = false;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        public readonly windowValuesService: WindowValuesService,
        public readonly shareService: ShareService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly modalService: BsModalService
    ) {
        super();
    }

    ngOnInit() {
        this.activatedRoute
            .parent!.params.pipe(
                switchMap((params) =>
                    this.tablesService.getTable(params.project, params.table)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
    }

    public toggleFullscreenTable() {
        this.fullscreenTable = !this.fullscreenTable;
    }

    public openFilterPreferencesManagerModal() {
        if (!this.table) {
            return;
        }
        openFilterPreferencesManagerModal(
            this.table.projectId,
            this.table.id,
            this.modalService
        );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
