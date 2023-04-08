import type { AfterViewChecked } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    ChangeDetectorRef,
} from '@angular/core';
import type { UUID } from '@cache-server/api/uuid';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-preview-modal',
    templateUrl: './preview-modal.component.html',
    styleUrls: ['./preview-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewModalComponent implements AfterViewChecked {
    public blob!: Blob | UUID;
    public fileName!: string;

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    public showPreview = false;

    ngAfterViewChecked() {
        // to show modal before file preview is loaded
        setTimeout(() => {
            this.showPreview = true;
            this.changeDetectorRef.markForCheck();
        }, 0);
    }
}
