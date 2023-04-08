import { moveItemInArray } from '@angular/cdk/drag-drop';
import type {
    FilterPreference,
    FiltersPreferences,
} from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import type { TranslateService } from '@ngx-translate/core';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { defaultFilter } from './normal-wrap-filter';

export class EditableFiltersPreferences {
    static async addFilterPreference(
        filtersPreferences: FiltersPreferences,
        newFilterPreference: FilterPreference,
        tableId: UUID,
        translateService: TranslateService
    ) {
        const newFiltersPreferences = cloneDeepWritable(filtersPreferences) as {
            [tableId: string]: FilterPreference[];
        };
        if (newFiltersPreferences[tableId]) {
            errors.assert(
                !newFiltersPreferences[tableId]!.some(
                    (filterPreference) =>
                        filterPreference.name === newFilterPreference.name
                )
            );
            newFiltersPreferences[tableId]!.push(newFilterPreference);
        } else {
            newFiltersPreferences[tableId] = [
                {
                    name: await translateService
                        .get(_('pages.entries.filters.all-entries'))
                        .toPromise(),
                    filter: defaultFilter,
                },
                newFilterPreference,
            ];
        }
        return newFiltersPreferences;
    }

    static removeFilterPreference(
        filtersPreferences: DeepWritable<FiltersPreferences>,
        tableId: UUID,
        name: string
    ): DeepWritable<FiltersPreferences> {
        const filtersPreference = filtersPreferences[tableId];
        errors.assert(!!filtersPreference);
        const newFiltersPreference = filtersPreference.filter(
            (filterPreference) => filterPreference.name !== name
        );
        if (newFiltersPreference.length > 0) {
            filtersPreferences[tableId] = newFiltersPreference;
        } else {
            delete filtersPreferences[tableId];
        }
        return filtersPreferences;
    }

    /**
     * Changes the filter of the specified filterPreference to the provided new one
     */
    static updateFilterPreference(
        filtersPreferences: FiltersPreferences,
        tableId: UUID,
        name: string,
        newFilter: FilterPreference['filter']
    ): FiltersPreferences {
        const newFiltersPreferences = cloneDeepWritable(filtersPreferences);
        newFiltersPreferences[tableId]!.find(
            (filterPreference) => filterPreference.name === name
        )!.filter = cloneDeepWritable(newFilter);
        return newFiltersPreferences;
    }

    static moveFilterPreference(
        filtersPreferences: DeepWritable<FiltersPreferences>,
        tableId: UUID,
        previousIndex: number,
        currentIndex: number
    ) {
        moveItemInArray(
            filtersPreferences[tableId]!,
            previousIndex,
            currentIndex
        );
        return filtersPreferences;
    }
    // TODO: rename
}
