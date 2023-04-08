import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-image-preview',
    templateUrl: './image-preview.component.html',
    styleUrls: ['./image-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePreviewComponent {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
}
