import type { ColumnOrderPreference } from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { CreateColumnOrderPreferenceModalComponent } from './create-column-order-preference-modal.component';

export async function createColumnOrderPreference(
    modalService: BsModalService,
    tableId: UUID,
    projectId: UUID
): Promise<ColumnOrderPreference | undefined> {
    const initialState: Partial<CreateColumnOrderPreferenceModalComponent> = {
        tableId,
        projectId,
    };
    return modalService
        .show(CreateColumnOrderPreferenceModalComponent, {
            initialState,
            class: 'modal-l',
        })
        .content?.columnOrderCreated.toPromise();
}
