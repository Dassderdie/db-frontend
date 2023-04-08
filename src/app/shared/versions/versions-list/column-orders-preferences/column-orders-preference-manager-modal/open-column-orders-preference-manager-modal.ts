import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { ColumnOrdersPreferenceManagerModalComponent } from './column-orders-preference-manager-modal.component';

export function openColumnOrdersPreferenceManagerModal(
    modalService: BsModalService,
    tableId: UUID,
    projectId: UUID
) {
    const initialState: Partial<ColumnOrdersPreferenceManagerModalComponent> = {
        tableId,
        projectId,
    };
    modalService.show(ColumnOrdersPreferenceManagerModalComponent, {
        initialState,
        class: 'modal-l',
    });
}
