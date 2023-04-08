import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { FileButtonsModule } from '@shared/versions/file-buttons/file-buttons.module';
import { DisplayFilesComponent } from './display-files/display-files.component';
import { FileNameComponent } from './file-name/file-name.component';
import { FileSortBtnComponent } from './file-sort-btn/file-sort-btn.component';
import { GetFileTypeIconPipe } from './get-file-type-icon.pipe';
import { AudioPreviewComponent } from './preview/audio-preview/audio-preview.component';
import { ExcelPreviewComponent } from './preview/excel-preview/excel-preview.component';
import { FilePreviewComponent } from './preview/file-preview/file-preview.component';
import { ImagePreviewComponent } from './preview/image-preview/image-preview.component';
import { MarkdownPreviewComponent } from './preview/markdown-preview/markdown-preview.component';
import { PdfPreviewComponent } from './preview/pdf-preview/pdf-preview.component';
import { PreviewModalComponent } from './preview/preview-modal/preview-modal.component';
import { TextPreviewComponent } from './preview/text-preview/text-preview.component';
import { VideoPreviewComponent } from './preview/video-preview/video-preview.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        TranslateModule,
        UtilityPipesModule,
        LoadingPlaceholderModule,
        MarkdownViewerModule,
        FileButtonsModule,
    ],
    declarations: [
        DisplayFilesComponent,
        FileNameComponent,
        FileSortBtnComponent,
        GetFileTypeIconPipe,
        PreviewModalComponent,
        FilePreviewComponent,
        ExcelPreviewComponent,
        ImagePreviewComponent,
        MarkdownPreviewComponent,
        AudioPreviewComponent,
        VideoPreviewComponent,
        PdfPreviewComponent,
        TextPreviewComponent,
    ],
    exports: [
        GetFileTypeIconPipe,
        FileSortBtnComponent,
        DisplayFilesComponent,
        FileNameComponent,
    ],
})
export class DisplayFilesModule {}
