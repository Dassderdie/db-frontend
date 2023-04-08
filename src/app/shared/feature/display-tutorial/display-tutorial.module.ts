import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayTutorialComponent } from './display-tutorial.component';

@NgModule({
    declarations: [DisplayTutorialComponent],
    imports: [CommonModule, TranslateModule, IconModule, UtilityPipesModule],
    exports: [DisplayTutorialComponent],
})
export class DisplayTutorialModule {}
