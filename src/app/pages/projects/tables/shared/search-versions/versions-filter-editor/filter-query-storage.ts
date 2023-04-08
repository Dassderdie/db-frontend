import type { Table } from '@cache-server/api/tables/table';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { objectToKey } from '@cache-server/object-to-key';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import { QueryStorage } from '@shared/versions/versions-list/utilities/query-storage';
import { defaultFilter } from '../filter-utility/normal-wrap-filter';

export class FilterQueryStorage {
    static queryToValueConverter(query: string | null) {
        return query ? JSON.parse(query) : cloneDeepWritable(defaultFilter);
    }

    static valueToQueryConverter(value: FilterGroup | null) {
        // objectToKey to make sure that `{ type: '', expressions: [] }` are the same string `{ expressions: [], type: '' }`
        return objectToKey(value);
    }

    static getKey(table: Table) {
        return `filter${table.id}`;
    }

    static async getQueryParams(filter: FilterGroup | null, table: Table) {
        return QueryStorage.getQueryParams(
            FilterQueryStorage.getKey(table),
            FilterQueryStorage.queryToValueConverter,
            FilterQueryStorage.valueToQueryConverter,
            filter
        );
    }
}
