import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { InputControlModule } from '../input-control/input-control.module';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { CheckboxInputComponent } from './checkbox-input.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        UtilityPipesModule,
        DirectivesModule,
        InputControlModule,
        MarkdownViewerModule,
        DirectivesModule,
        ValidationModule,
        DescriptionModule,
    ],
    declarations: [CheckboxInputComponent],
    exports: [CheckboxInputComponent],
})
export class CheckboxInputModule {}
