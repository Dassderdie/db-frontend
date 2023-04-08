import type { UUID } from '@cache-server/api/uuid';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { PreviewModalComponent } from './preview-modal.component';

export function previewFilesModal(
    blob: Blob | UUID,
    fileName: string,
    bsModalService: BsModalService
) {
    const initialState: Partial<PreviewModalComponent> = {
        blob,
        fileName,
    };
    bsModalService.show(PreviewModalComponent, {
        initialState,
        class: 'modal-xl',
    });
}
