import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { FilterHiddenErrorsPipe } from './filter-hidden-errors.pipe';
import { ProcessStateErrorsPipe } from './process-state-errors.pipe';
import { ValidationComponent } from './validation.component';
import { DisplayErrorsComponent } from './display-errors/display-errors.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        LoadingPlaceholderModule,
        UtilityPipesModule,
    ],
    declarations: [
        ValidationComponent,
        FilterHiddenErrorsPipe,
        ProcessStateErrorsPipe,
        DisplayErrorsComponent,
    ],
    exports: [ValidationComponent],
})
export class ValidationModule {}
