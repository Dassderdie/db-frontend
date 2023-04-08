import type { ProgressCounter } from '@shared/utility/components/global-loading-placeholder/progress-counter';
import type { BsModalService } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { GlobalLoadingPlaceholderComponent } from './global-loading-placeholder.component';

export async function activateGlobalLoadingPlaceholder(
    progressCounter: ProgressCounter,
    description: string,
    modalService: BsModalService
) {
    const initialState: Partial<GlobalLoadingPlaceholderComponent> = {
        progressCounter,
        description,
    };
    const bsModalRef = modalService.show(GlobalLoadingPlaceholderComponent, {
        initialState,
        class: 'modal-dialog-centered modal-sm',
        ignoreBackdropClick: true,
    });
    return bsModalRef.onHidden && firstValueFrom(bsModalRef.onHidden);
}
