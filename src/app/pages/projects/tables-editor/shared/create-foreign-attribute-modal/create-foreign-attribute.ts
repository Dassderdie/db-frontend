import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { CreateForeignAttributeModalComponent } from './create-foreign-attribute-modal.component';

export function createForeignAttribute(
    projectId: UUID,
    tableId: UUID | null | undefined,
    isForeignSingle: boolean,
    bsModalService: BsModalService
) {
    const initialState: Partial<CreateForeignAttributeModalComponent> = {
        projectId,
        tableId,
        isForeignSingle,
    };
    const bsModalRef = bsModalService.show(
        CreateForeignAttributeModalComponent,
        {
            initialState,
            class: 'modal-lg',
        }
    );
    return bsModalRef.content!.foreignAttributeCreated;
}
