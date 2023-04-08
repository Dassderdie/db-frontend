import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { CheckboxInputModule } from './checkbox-input/checkbox-input.module';
import { DateInputComponent } from './date-input/date-input.component';
import { DateInputModule } from './date-input/date-input.module';
import { DateTimeInputComponent } from './date-time-input/date-time-input.component';
import { DateTimeInputModule } from './date-time-input/date-time-input.module';
import { InputComponent } from './input/input.component';
import { ListInputComponent } from './list-input/list-input.component';
import { ListInputModule } from './list-input/list-input.module';
import { MarkdownInputComponent } from './markdown-input/markdown-input.component';
import { MarkdownInputModule } from './markdown-input/markdown-input.module';
import { NumberInputComponent } from './number-input/number-input.component';
import { NumberInputModule } from './number-input/number-input.module';
import { RealStringInputComponent } from './real-string-input/real-string-input.component';
import { RealStringInputModule } from './real-string-input/real-string-input.module';
import { SelectInputComponent } from './select-input/select-input.component';
import { SelectInputModule } from './select-input/select-input.module';
import { AddonComponent } from './shared/addon/addon.component';
import { AddonModule } from './shared/addon/addon.module';
import { DescriptionModule } from './shared/description/description.module';
import { ValidationComponent } from './shared/validation/validation.component';
import { ValidationModule } from './shared/validation/validation.module';
import { StringInputComponent } from './string-input/string-input.component';
import { StringInputModule } from './string-input/string-input.module';
import { TimeInputComponent } from './time-input/time-input.component';
import { TimeInputModule } from './time-input/time-input.module';

@NgModule({
    imports: [
        CommonModule,
        AddonModule,
        CheckboxInputModule,
        DateInputModule,
        DateTimeInputModule,
        SelectInputModule,
        StringInputModule,
        NumberInputModule,
        TimeInputModule,
        MarkdownInputModule,
        ValidationModule,
        ListInputModule,
        DirectivesModule,
        UtilityPipesModule,
        IconModule,
        TranslateModule,
        RealStringInputModule,
        MarkdownViewerModule,
        DescriptionModule,
    ],
    declarations: [InputComponent],
    exports: [
        InputComponent,
        StringInputComponent,
        NumberInputComponent,
        RealStringInputComponent,
        MarkdownInputComponent,
        TimeInputComponent,
        DateTimeInputComponent,
        SelectInputComponent,
        CheckboxInputModule,
        DateInputComponent,
        ListInputComponent,
        ValidationComponent,
        AddonComponent,
    ],
})
export class InputsModule {}
