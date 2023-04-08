import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShowMoreModule } from '@main-shared/show-more/show-more.module';
import { MarkdownViewerComponent } from './markdown-viewer.component';

@NgModule({
    declarations: [MarkdownViewerComponent],
    imports: [CommonModule, ShowMoreModule],
    exports: [MarkdownViewerComponent],
})
export class MarkdownViewerModule {}
