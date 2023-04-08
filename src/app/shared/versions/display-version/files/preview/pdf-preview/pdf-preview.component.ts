import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-pdf-preview',
    templateUrl: './pdf-preview.component.html',
    styleUrls: ['./pdf-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPreviewComponent {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
}
