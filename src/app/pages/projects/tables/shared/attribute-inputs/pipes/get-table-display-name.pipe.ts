import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'getTableDisplayName',
})
export class GetTableDisplayNamePipe implements PipeTransform {
    constructor(private readonly tablesService: TablesService) {}

    transform(projectId: UUID, tableId: UUID) {
        return this.tablesService
            .getTable(projectId, tableId)
            .pipe(map((table) => table.displayNames));
    }
}
