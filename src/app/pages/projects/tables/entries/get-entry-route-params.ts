import type { ActivatedRoute } from '@angular/router';
import type { UUID } from '@cache-server/api/uuid';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @param route the activated route object of the component (under .../projects/:project/tables/:table/entries/:entry...)
 * @returns an Observable of the params
 */
export function getEntryRouteParams(route: ActivatedRoute) {
    return combineLatest([
        route.parent!.parent!.parent!.params,
        route.parent!.params,
    ]).pipe(
        map(
            (params) =>
                ({
                    projectId: params[0].project as UUID,
                    tableId: params[0].table as UUID,
                    entryId: params[1].entry as UUID,
                } as const)
        )
    );
}
