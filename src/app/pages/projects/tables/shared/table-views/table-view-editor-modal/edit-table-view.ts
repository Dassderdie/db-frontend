import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { TableViewEditorModalComponent } from './table-view-editor-modal.component';

export function editTableView(
    projectId: UUID,
    tableId: UUID,
    bsModalService: BsModalService
) {
    const initialState: Partial<TableViewEditorModalComponent> = {
        tableId,
        projectId,
    };
    bsModalService.show(TableViewEditorModalComponent, {
        initialState,
    });
}
