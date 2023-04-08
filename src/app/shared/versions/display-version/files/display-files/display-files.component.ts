import type { OnChanges } from '@angular/core';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FilesAttribute } from '@cache-server/api/tables/attribute';
import { UUID } from '@cache-server/api/uuid';
import type { FilesValue } from '@cache-server/api/versions/version';
import { BlobsService } from '@core/cache-client/api/blobs/blobs.service';
import { saveBlob } from '@shared/utility/functions/save-blob';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { BsModalService } from 'ngx-bootstrap/modal';
import { previewFilesModal } from '../preview/preview-modal/preview-files-modal';
import { sortFileKeys } from '../sort-file.keys';

@Component({
    selector: 'app-display-files',
    templateUrl: './display-files.component.html',
    styleUrls: ['./display-files.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayFilesComponent implements OnChanges {
    @Input() attribute!: FilesAttribute;
    @Input() value!: FilesValue | null;
    /**
     * The current projectId (for the creatorId)
     */
    @Input() projectId!: UUID;
    @Input() small!: boolean;

    public displayFilesKeys: ReadonlyArray<string> = [];

    public sortObject: Readonly<{
        key: 'name' | 'size';
        order: -1 | 1;
    }> = {
        key: 'name',
        order: 1,
    };

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly blobsService: BlobsService
    ) {}

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.value) {
            this.updateFileKeys();
        }
    }

    public previewFile(fileName: string) {
        previewFilesModal(
            this.value![fileName]!.blobId,
            fileName,
            this.bsModalService
        );
    }

    public downloadFile(fileName: string) {
        this.blobsService
            .getBlob(this.value![fileName]!.blobId, fileName, true)
            .then((blob) => saveBlob(blob, fileName));
    }

    public toggleSortBy(key: 'name' | 'size') {
        this.sortObject = {
            order:
                // when first selecting a key the order should be 1
                this.sortObject.key === key && this.sortObject.order === -1
                    ? 1
                    : -1,
            key,
        };
        this.sortFileKeys();
    }

    /**
     * Updates the keys used to display the files in the table, respecting the sortObject
     */
    private updateFileKeys() {
        this.displayFilesKeys = Object.keys(this.value ?? {});
        this.sortFileKeys();
    }

    private sortFileKeys() {
        this.displayFilesKeys = this.displayFilesKeys = sortFileKeys(
            this.displayFilesKeys,
            this.sortObject.key,
            this.sortObject.order,
            this.value
        );
    }
}
