import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-video-preview',
    templateUrl: './video-preview.component.html',
    styleUrls: ['./video-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPreviewComponent {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
}
