import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { MarkdownInputComponent } from './markdown-input.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        PopoverModule,
        UtilityPipesModule,
        MarkdownViewerModule,
        ValidationModule,
        DescriptionModule,
        NamesModule,
    ],
    declarations: [MarkdownInputComponent],
    exports: [MarkdownInputComponent],
})
export class MarkdownInputModule {}
