import type { Table } from '@cache-server/api/tables/table';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { CreateNewFilterPreferenceModalComponent } from './create-new-filter-preference-modal.component';

export function createNewFilterPreference(
    table: Table,
    filter: FilterGroup | null,
    modalService: BsModalService
) {
    const initialState: Partial<CreateNewFilterPreferenceModalComponent> = {
        table,
        filter,
    };
    const bsModalRef = modalService.show(
        CreateNewFilterPreferenceModalComponent,
        {
            initialState,
        }
    );
    return bsModalRef.content!.newFilterPreference$.pipe(take(1));
}
