import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { InputControlModule } from '../input-control/input-control.module';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { NumberInputComponent } from './number-input.component';

@NgModule({
    declarations: [NumberInputComponent],
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        InputControlModule,
        DirectivesModule,
        UtilityPipesModule,
        ValidationModule,
        DescriptionModule,
    ],
    exports: [NumberInputComponent],
})
export class NumberInputModule {}
