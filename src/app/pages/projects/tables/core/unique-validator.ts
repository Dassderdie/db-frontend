import type { UUID } from '@cache-server/api/uuid';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import type { VersionsService } from '@core/cache-client/api/versions/versions.service';
import type { AsyncValidator } from '@shared/utility/classes/state/validator-state';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { of, timer } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

export function uniqueEntryValidator<
    T extends boolean | number | string | null
>(
    versionsApi: VersionsService,
    projectId: UUID,
    tableId: UUID,
    attribute: UUID,
    entryId?: UUID
): AsyncValidator<T> {
    return (value: T) => {
        if (value === null) {
            return of(null);
        }
        return timer(500).pipe(
            switchMap(() => {
                const filter: FilterGroup = {
                    type: 'and',
                    expressions: [
                        {
                            type: 'equal',
                            key: attribute,
                            value,
                        },
                        {
                            type: 'equal',
                            key: 'invalidatedAt',
                            value: null,
                        },
                    ],
                };
                return versionsApi
                    .getVersions(
                        projectId,
                        tableId,
                        JSON.stringify(filter),
                        undefined,
                        undefined,
                        undefined,
                        1
                    )
                    .pipe(
                        first(),
                        map((results) =>
                            results.totalVersionCount === 0 ||
                            (results.totalVersionCount === 1 &&
                                results.versions[0]!.entryId === entryId)
                                ? null
                                : {
                                      unique: {
                                          value,
                                          translationKey: _(
                                              'validators.error.unique'
                                          ),
                                      },
                                  }
                        )
                    );
            })
        );
    };
}
