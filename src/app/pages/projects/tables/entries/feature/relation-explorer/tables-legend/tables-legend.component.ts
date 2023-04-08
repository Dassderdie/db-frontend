import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import type { Table } from '@cache-server/api/tables/table';
import { TableColorService } from '@tables/core/table-color.service';

@Component({
    selector: 'app-tables-legend',
    templateUrl: './tables-legend.component.html',
    styleUrls: ['./tables-legend.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesLegendComponent {
    @Input() tables!: ReadonlyArray<Table>;

    constructor(public readonly tableColorService: TableColorService) {}
}
