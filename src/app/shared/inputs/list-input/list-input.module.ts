import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { StringInputModule } from '../string-input/string-input.module';
import { ListInputComponent } from './list-input.component';

@NgModule({
    declarations: [ListInputComponent],
    imports: [
        StringInputModule,
        CommonModule,
        TranslateModule,
        UtilityPipesModule,
        IconModule,
        DirectivesModule,
        ValidationModule,
        DescriptionModule,
    ],
    exports: [ListInputComponent],
})
export class ListInputModule {}
