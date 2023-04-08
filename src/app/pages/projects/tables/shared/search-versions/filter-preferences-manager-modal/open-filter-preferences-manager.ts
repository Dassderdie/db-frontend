import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { FilterPreferencesManagerModalComponent } from './filter-preferences-manager-modal.component';

export function openFilterPreferencesManagerModal(
    projectId: UUID,
    tableId: UUID,
    bsModalService: BsModalService
) {
    const initialState: Partial<FilterPreferencesManagerModalComponent> = {
        tableId,
        projectId,
    };
    bsModalService.show(FilterPreferencesManagerModalComponent, {
        initialState,
    });
}
