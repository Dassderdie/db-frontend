import type { OnChanges, OnDestroy } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import type { Table } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Subscription } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-new-foreign-entry-btn',
    templateUrl: './create-new-foreign-entry-btn.component.html',
    styleUrls: ['./create-new-foreign-entry-btn.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNewForeignEntryBtnComponent
    extends Destroyed
    implements OnChanges, OnDestroy
{
    /**
     * the id of the project the table with the here specified attributes is in
     */
    @Input() projectId!: UUID;
    /**
     * the id of the table/intermediateTable the foreign attribute points to
     */
    @Input() foreignTableId!: UUID;
    /**
     * classes hat should be added to the button
     */
    @Input() btnClasses = '';

    public readonly breakpoints = Breakpoints;
    public readonly foreignTable$ = new ReplaySubject<Table>(1);

    constructor(private readonly tablesService: TablesService) {
        super();
    }

    private tableSubscription?: Subscription;

    ngOnChanges() {
        this.tableSubscription?.unsubscribe();
        this.tableSubscription = this.tablesService
            .getTable(this.projectId, this.foreignTableId)
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.foreignTable$);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.foreignTable$.complete();
    }
}
