import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-entry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryComponent extends Destroyed implements OnInit, OnDestroy {
    public table$ = new ReplaySubject<Table>(1);

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService
    ) {
        super();
    }

    ngOnInit() {
        (
            this.activatedRoute.parent!.parent!.params as Observable<{
                project: UUID;
                table: UUID;
            }>
        )
            .pipe(
                switchMap(({ project, table }) =>
                    this.tablesService.getTable(project, table)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(this.table$);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
