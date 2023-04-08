import { Injectable } from '@angular/core';
import type { JsonObject } from '@shared/utility/types/json-object';
import { isUndefined, omitBy } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationModalService {
    constructor(private readonly bsModalService: BsModalService) {}

    public async confirm(options: ConfirmationOptions) {
        const initialState: Partial<ConfirmationModalComponent> = omitBy(
            options,
            isUndefined
        );
        const dialogRef = this.bsModalService.show(ConfirmationModalComponent, {
            initialState,
        });
        return dialogRef.content!.confirmation$.toPromise();
    }
}

export interface ConfirmationOptions {
    title: string;
    titleParams?: JsonObject;
    description: string;
    descriptionsParams?: JsonObject;
    btnOkText?: string;
    btnCancelText?: string;
    confirmationString?: string;
    kind?: 'danger' | 'success' | 'warning';
}
