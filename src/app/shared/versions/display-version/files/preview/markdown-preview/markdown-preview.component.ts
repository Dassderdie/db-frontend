import type { OnChanges } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-markdown-preview',
    templateUrl: './markdown-preview.component.html',
    styleUrls: ['./markdown-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownPreviewComponent implements OnChanges {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;

    public markdownText$ = new ReplaySubject<string>(1);

    ngOnChanges() {
        const reader = new FileReader();
        reader.readAsText(this.blob);
        reader.onloadend = (e) => {
            this.markdownText$.next(reader.result as string);
        };
    }
}
