import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { DescriptionModule } from '../description/description.module';
import { AddonComponent } from './addon.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        IconModule,
        UtilityPipesModule,
        AttributePipesModule,
        DirectivesModule,
        MarkdownViewerModule,
        DescriptionModule,
        NamesModule,
    ],
    declarations: [AddonComponent],
    exports: [AddonComponent],
})
export class AddonModule {}
