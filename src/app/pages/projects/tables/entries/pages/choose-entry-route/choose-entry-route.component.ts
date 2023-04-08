import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { getEntryRouteParams } from '@entries/get-entry-route-params';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { ReplaySubject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-choose-entry-route',
    templateUrl: './choose-entry-route.component.html',
    styleUrls: ['./choose-entry-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseEntryRouteComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    // To use it in template
    public breakpoints = Breakpoints;

    public readonly params$ = new ReplaySubject<{
        projectId: UUID;
        tableId: UUID;
        entryId: UUID;
    }>(1);
    public table$ = new ReplaySubject<Table>(1);

    // TODO: correct permissions
    public permissionLevel = 3;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService
    ) {
        super();
    }

    ngOnInit() {
        getEntryRouteParams(this.activatedRoute)
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.params$);
        this.params$
            .pipe(
                switchMap(({ projectId, tableId }) =>
                    this.tablesService.getTable(projectId, tableId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(this.table$);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
