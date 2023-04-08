import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { AddEntriesModalComponent } from './add-entries-modal.component';

export async function chooseEntries(
    tableId: UUID,
    projectId: UUID,
    modalService: BsModalService,
    relationshipMax?: number | null
): Promise<ReadonlyArray<Version> | undefined> {
    const initialState: Partial<AddEntriesModalComponent> = {
        tableId,
        projectId,
        maxSelected: relationshipMax,
    };
    const bsModalRef = modalService.show(AddEntriesModalComponent, {
        initialState,
        class: 'modal-xl',
    });
    return bsModalRef.content!.chosenEntries;
}
