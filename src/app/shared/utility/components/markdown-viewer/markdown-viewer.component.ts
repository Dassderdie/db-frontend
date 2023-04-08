import type { OnChanges } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    NgZone,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
// Only import, because the actual viewer is dynamically loaded when it is used
import type Viewer from '@toast-ui/editor';

@Component({
    selector: 'app-markdown-viewer',
    templateUrl: './markdown-viewer.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./markdown-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownViewerComponent implements OnChanges {
    @Input() markdownText?: string | null;
    @Input() maxHeight = 'auto';
    @Input() overflow: 'auto' | 'hidden' | 'showMore' = 'auto';

    public viewer!: Viewer;
    private wrapper?: ElementRef<HTMLElement>;
    // wether the viewer is currently initialising (semaphore)
    private initializingViewer = false;

    constructor(
        private readonly domSanitizer: DomSanitizer,
        private readonly ngZone: NgZone
    ) {}

    @ViewChild('viewerWrapper', { static: false }) set registerWrapper(
        wrapper: ElementRef
    ) {
        this.wrapper = wrapper;
        // ngAfterInit cannot be used for triggering, because of some angular timing issues with *ngIf in the template
        this.initialiseViewer();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (this.viewer && changes.markdownText) {
            this.ngZone.runOutsideAngular(() =>
                this.viewer.setMarkdown(this.markdownText ?? '')
            );
        }
        this.initialiseViewer();
    }

    private initialiseViewer() {
        if (
            !this.wrapper ||
            this.viewer ||
            this.initializingViewer ||
            // do not waste valuable resources for a viewer that shows nothing
            !this.markdownText
        ) {
            return;
        }
        this.initializingViewer = true;
        // timeout to not block important computations
        setTimeout(
            async () =>
                this.ngZone.runOutsideAngular(async () => {
                    const lazyViewer = await import(
                        // @ts-expect-error: The typings are exported somewhere else ...
                        '@toast-ui/editor/dist/toastui-editor-viewer'
                    );
                    this.viewer = new lazyViewer.default({
                        el: this.wrapper!.nativeElement,
                        initialValue: this.markdownText ?? '',
                        customHTMLSanitizer: (html: string) =>
                            this.domSanitizer.sanitize(
                                SecurityContext.HTML,
                                html
                            ) ?? '',
                    });
                }),
            0
        );
    }
}
