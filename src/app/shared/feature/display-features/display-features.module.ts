import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayFeaturesComponent } from './display-features.component';

@NgModule({
    declarations: [DisplayFeaturesComponent],
    imports: [CommonModule, TranslateModule, IconModule, UtilityPipesModule],
    exports: [DisplayFeaturesComponent],
})
export class DisplayFeaturesModule {}
