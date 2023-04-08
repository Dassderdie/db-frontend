import type { OnChanges } from '@angular/core';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FilesAttribute } from '@cache-server/api/tables/attribute';
import { UUID } from '@cache-server/api/uuid';
import type { FilesValue } from '@cache-server/api/versions/version';
import { BlobsService } from '@core/cache-client/api/blobs/blobs.service';
import { saveBlob } from '@shared/utility/functions/save-blob';
import { previewFilesModal } from '@shared/versions/display-version/files/preview/preview-modal/preview-files-modal';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-files-changes',
    templateUrl: './files-changes.component.html',
    styleUrls: ['./files-changes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesChangesComponent implements OnChanges {
    /**
     * wether unchanged files should be shown or only the ones changed
     */
    @Input() showUnchanged!: boolean;
    @Input() attribute!: FilesAttribute;
    @Input() projectId!: UUID;
    @Input() currentFiles!: FilesValue | null;
    @Input() oldFiles?: FilesValue | null;

    public rows: ReadonlyArray<FilesChangesRow> = [];

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly blobsService: BlobsService
    ) {}

    ngOnChanges() {
        const currentFileNames = Object.keys(this.currentFiles ?? {});
        const previousFileNames = Object.keys(this.oldFiles ?? {});
        const newRows: FilesChangesRow[] = [];
        for (const currentName of currentFileNames) {
            const file = this.currentFiles![currentName]!;
            const previousName = previousFileNames.find(
                (name) => file.blobId === this.oldFiles![name]!.blobId
            );
            const status = previousName
                ? previousName === currentName
                    ? 'unchanged'
                    : 'renamed'
                : 'new';
            if (status === 'unchanged' && !this.showUnchanged) {
                continue;
            }
            newRows.push({
                status,
                blobId: file.blobId,
                blobInformation: file.blobInformation,
                name: {
                    currentName,
                    previousName,
                },
            });
        }
        for (const previousName of previousFileNames) {
            const previousFile = this.oldFiles![previousName]!;
            const currentName = currentFileNames.find(
                (name) =>
                    previousFile.blobId === this.currentFiles![name]!.blobId
            );
            if (currentName) {
                continue;
            }
            newRows.push({
                status: 'deleted',
                blobId: previousFile.blobId,
                blobInformation: previousFile.blobInformation,
                name: {
                    previousName,
                },
            });
        }
        this.rows = newRows;
    }

    public previewFile(row: FilesChangesRow) {
        previewFilesModal(
            row.blobId,
            this.getNewestName(row),
            this.bsModalService
        );
    }

    public downloadFile(row: FilesChangesRow) {
        const newestName = this.getNewestName(row);
        this.blobsService
            .getBlob(row.blobId, newestName, true)
            .then((blob) => saveBlob(blob, newestName));
    }

    private getNewestName(row: FilesChangesRow) {
        return (row.name.currentName ?? row.name.previousName)!;
    }
}

interface FilesChangesRow {
    status: 'deleted' | 'new' | 'renamed' | 'unchanged';
    blobId: UUID;
    blobInformation: {
        rawSize: number;
        creatorId: UUID;
    };
    name: {
        currentName?: string;
        /**
         * not defined if the name hasn't changed
         */
        previousName?: string;
    };
}
