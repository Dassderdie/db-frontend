import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Table } from '@cache-server/api/tables/table';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { ShareService } from '@core/utility/share/share.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    public table?: Table;
    public filter?: string | null;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        public readonly shareService: ShareService,
        private readonly changeDetectorRef: ChangeDetectorRef
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

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
