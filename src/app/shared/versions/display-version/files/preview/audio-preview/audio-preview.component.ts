import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-audio-preview',
    templateUrl: './audio-preview.component.html',
    styleUrls: ['./audio-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPreviewComponent {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
}
