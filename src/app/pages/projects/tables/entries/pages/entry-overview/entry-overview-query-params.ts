import type { Params } from '@angular/router';

export interface EntryOverviewQueryParams extends Params {
    /**
     * Wether shortcuts for creating a new entry should be shown
     */
    showCreateShortcut?: true;
}
