import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { JsonObject } from '@shared/utility/types/json-object';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { CustomValidators } from 'src/app/shared/inputs/shared/validation/custom-validators';
import { StringInput } from 'src/app/shared/inputs/string-input/string-input';
import type { ConfirmationOptions } from './confirmation-modal.service';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent
    implements OnDestroy, OnInit, ConfirmationOptions
{
    public title = '???';
    public titleParams?: JsonObject;
    public description = '???';
    public descriptionsParams?: JsonObject;
    public btnOkText?: string;
    public btnCancelText: string = _('confirmation-modal.default-btn-cancel');
    public kind: 'danger' | 'success' | 'warning' = 'danger';
    /**
     * if defined the user has to type in the specified string to be able to confirm the action
     */
    public confirmationString?: string;
    /**
     * emits when the modal closes
     * true - the action has been confirmed
     * false - the action has been dismissed
     * null - the modal has been closed (cross/click on background)
     */
    public confirmation$ = new Subject<boolean | null>();
    public confirmationInput = new StringInput('confirmationString', null, {
        placeholder: _('confirmation-modal.confirm-string-placeholder'),
    });
    constructor(public readonly bsModalRef: BsModalRef) {}

    ngOnInit() {
        if (this.confirmationString) {
            this.confirmationInput.setValidators([
                CustomValidators.pattern(this.confirmationString),
                CustomValidators.required(),
            ]);
        }
    }

    ngOnDestroy() {
        this.confirmation$.complete();
    }
}
