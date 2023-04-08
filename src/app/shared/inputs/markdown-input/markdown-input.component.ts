import type {
    AfterViewInit,
    OnChanges,
    OnDestroy,
    OnInit,
    TemplateRef,
} from '@angular/core';
import {
    Component,
    Input,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ElementRef,
    NgZone,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/i18n/de-de';
import { Subject } from 'rxjs';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { MarkdownInput } from './markdown-input';

@Component({
    selector: 'app-markdown-input',
    templateUrl: './markdown-input.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./markdown-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownInputComponent
    extends SpecialInputComponent
    implements OnInit, OnDestroy, Destroyed, AfterViewInit, OnChanges
{
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: MarkdownInput;
    @ViewChild('editorWrapper', { static: true }) editorWrapper!: ElementRef;

    readonly destroyed = new Subject();

    private readonly value$ = new Subject();
    editor?: Editor;
    public currentHeight = 150;

    constructor(
        private readonly translateService: TranslateService,
        private readonly domSanitizer: DomSanitizer,
        private readonly ngZone: NgZone,
        private readonly changedDetectorRef: ChangeDetectorRef,
        private readonly i18nService: I18nService
    ) {
        super(changedDetectorRef);
    }

    ngOnInit() {
        this.currentHeight = this.control.height;
        this.value$
            .pipe(debounceTime(250), takeUntil(this.destroyed))
            .subscribe(() => {
                if (this.editor) {
                    this.control.setValue(this.editor.getMarkdown());
                }
            });
        this.control.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe((value) => {
                if (this.editor && value !== this.editor.getMarkdown()) {
                    this.editor.setMarkdown(value ?? '');
                }
            });
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.autofocus?.currentValue) {
            this.editor?.focus();
        }
        super.ngOnChanges(changes);
    }

    ngAfterViewInit() {
        // Translate tooltip-text
        this.translateService
            .get([
                _('custom-form.markdown.toggle-mode.name'),
                _('custom-form.markdown.toggle-mode.tooltip'),
                _('custom-form.markdown.make-larger.tooltip'),
                _('custom-form.markdown.make-smaller.tooltip'),
                this.control.placeholder,
            ])
            .pipe(first())
            .toPromise()
            .then((translations) =>
                // to make the (computeheavy) initialisation of the editor not blocking
                setTimeout(() => this.initEditor(translations), 0)
            );
    }

    private initEditor(translations: { [key: string]: string }) {
        this.ngZone.runOutsideAngular(() => {
            // Initialise markdown-editor
            this.editor = new Editor({
                el: this.editorWrapper.nativeElement,
                initialValue: this.control.value ? this.control.value : '',
                language: this.i18nService.currentLanguageBCP47,
                initialEditType: 'wysiwyg',
                previewStyle: 'vertical',
                height: `${this.currentHeight}px`,
                usageStatistics: false,
                customHTMLSanitizer: (html: string) =>
                    this.domSanitizer.sanitize(SecurityContext.HTML, html) ??
                    '',
                placeholder: translations[this.control.placeholder],
                toolbarItems: [
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link'],
                    ['code', 'codeblock'],
                    // custom buttons
                    [
                        {
                            el: this.createButton(
                                translations[
                                    _('custom-form.markdown.toggle-mode.name')
                                ] ?? '',
                                (e) => {
                                    if (this.editor!.isWysiwygMode()) {
                                        this.editor!.changeMode('markdown');
                                    } else {
                                        this.editor!.changeMode('wysiwyg');
                                    }
                                }
                            ),
                            tooltip:
                                translations[
                                    _(
                                        'custom-form.markdown.toggle-mode.tooltip'
                                    )
                                ],
                        },
                    ],
                    [
                        {
                            el: this.createButton('+', (e) => {
                                this.currentHeight +=
                                    this.currentHeight >= this.control.maxHeight
                                        ? 0
                                        : this.control.heightStep;
                                this.changedDetectorRef.markForCheck();
                                this.editor!.setHeight(
                                    `${this.currentHeight}px`
                                );
                            }),
                            tooltip:
                                translations[
                                    _(
                                        'custom-form.markdown.make-larger.tooltip'
                                    )
                                ],
                        },
                        {
                            el: this.createButton('-', (e) => {
                                this.currentHeight -=
                                    this.currentHeight <= this.control.height
                                        ? 0
                                        : this.control.heightStep;
                                this.changedDetectorRef.markForCheck();
                                this.editor!.setHeight(
                                    `${this.currentHeight}px`
                                );
                            }),
                            tooltip:
                                translations[
                                    _(
                                        'custom-form.markdown.make-smaller.tooltip'
                                    )
                                ],
                        },
                    ],
                ] as any,
            });
            // TODO: add fullscreen
            this.editor.on('change', () => {
                this.ngZone.run(() => this.value$.next(undefined));
            });
            if (this.autofocus) {
                this.editor.focus();
            }
        });
    }

    private createButton(
        innerHTML: string,
        onClick: (event: MouseEvent) => void
    ) {
        const button = document.createElement('button');
        button.className = 'toastui-editor-toolbar-icons';
        button.style.backgroundImage = 'none';
        button.style.width = 'auto';
        button.style.margin = '0';
        button.innerHTML = innerHTML;
        button.onclick = onClick;
        return button;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
