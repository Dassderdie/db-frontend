import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { SelectInputComponent } from './select-input.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        BsDropdownModule.forRoot(),
        UtilityPipesModule,
        DirectivesModule,
        NamesModule,
        ValidationModule,
        DescriptionModule,
        LoadingPlaceholderModule,
    ],
    declarations: [SelectInputComponent],
    exports: [SelectInputComponent],
})
export class SelectInputModule {}
