import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { DescriptionTooltipDirective } from './description-tooltip.directive';
import { DescriptionComponent } from './description.component';

@NgModule({
    imports: [
        CommonModule,
        MarkdownViewerModule,
        TranslateModule,
        UtilityPipesModule,
    ],
    declarations: [DescriptionComponent, DescriptionTooltipDirective],
    exports: [DescriptionComponent, DescriptionTooltipDirective],
})
export class DescriptionModule {}
