import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-email-verification-modal',
    templateUrl: './email-verification-modal.component.html',
    styleUrls: ['./email-verification-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerificationModalComponent {
    constructor(public readonly bsModalRef: BsModalRef) {}
}
