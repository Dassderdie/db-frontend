import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { NewTable, Table } from '@cache-server/api/tables/table';
import type { EditableTable } from '@tables-editor/pages/editable-table';

@Component({
    selector: 'app-table-name',
    templateUrl: './table-name.component.html',
    styleUrls: ['./table-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableNameComponent {
    @Input() table!: EditableTable | NewTable | Table;
    @Input() showIcon!: boolean;
}
