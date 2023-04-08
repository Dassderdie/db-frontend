import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getFileExtension } from '@cache-server/api/blobs/get-file-extension';
import type { UUID } from '@cache-server/api/uuid';
import { BlobsService } from '@core/cache-client/api/blobs/blobs.service';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { excelFileTypes } from '../excel-preview/excel-file-types';

@Component({
    selector: 'app-file-preview',
    templateUrl: './file-preview.component.html',
    styleUrls: ['./file-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewComponent implements OnChanges, OnDestroy {
    /**
     * Either the blobId which should be used to get the blob from the server or the blob itself
     */
    @Input() blob!: Blob | UUID;
    /**
     * The name of the file
     */
    @Input() fileName!: string;

    /**
     * The extension of the file
     */
    public type?:
        | 'audio'
        | 'default'
        | 'excel'
        | 'image'
        | 'markdown'
        | 'pdf'
        | 'text'
        | 'video';
    /**
     * A local url to the blob
     */
    public blobUrl?: string;
    /**
     * the actual blob
     */
    public blobObject?: Blob;

    private blobUpdateId = 0;

    constructor(
        private readonly domSanitizer: DomSanitizer,
        private readonly blobsService: BlobsService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.blob) {
            this.blobUpdateId++;
            if (typeof this.blob === 'string') {
                // load the blob
                const blobUpdateId = this.blobUpdateId;
                this.blobsService
                    .getBlob(this.blob, this.fileName, true)
                    .then((blob) => {
                        if (blobUpdateId !== this.blobUpdateId) {
                            return;
                        }
                        this.revokeBlobUrl();
                        this.blobObject = blob;
                        this.updateBlobUrl();
                    })
                    .catch((error: any) => errors.error({ error }));
            } else {
                this.revokeBlobUrl();
                this.blobObject = this.blob;
                this.updateBlobUrl();
            }
        }
    }

    private updateBlobUrl() {
        this.blobUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(this.blobObject)
        ) as string;
        const extension = getFileExtension(this.fileName);
        const type = this.blobObject!.type;
        if (
            type === 'application/vnd.ms-excel' ||
            (extension && excelFileTypes.includes(extension))
        ) {
            this.type = 'excel';
        } else if (type.startsWith('image')) {
            this.type = 'image';
        } else if (type.startsWith('video')) {
            this.type = 'video';
        } else if (type.startsWith('audio')) {
            this.type = 'audio';
        } else if (extension === 'md') {
            this.type = 'markdown';
        } else if (type.startsWith('text')) {
            this.type = 'text';
        } else if (type === 'application/pdf') {
            this.type = 'pdf';
        } else {
            this.type = 'default';
        }
        this.changeDetectorRef.markForCheck();
    }

    private revokeBlobUrl() {
        if (this.blobUrl) {
            // free memory by revoking the blob from it
            URL.revokeObjectURL(this.blobUrl);
        }
    }

    ngOnDestroy() {
        this.revokeBlobUrl();
    }
}
