import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayPitchComponent } from './display-pitch.component';

@NgModule({
    declarations: [DisplayPitchComponent],
    imports: [CommonModule, TranslateModule, IconModule, UtilityPipesModule],
    exports: [DisplayPitchComponent],
})
export class DisplayPitchModule {}
