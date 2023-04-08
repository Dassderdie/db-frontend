import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-text-preview',
    templateUrl: './text-preview.component.html',
    styleUrls: ['./text-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPreviewComponent {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
}
