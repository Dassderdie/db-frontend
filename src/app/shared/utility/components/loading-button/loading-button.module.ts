import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingButtonComponent } from './loading-button.component';

@NgModule({
    declarations: [LoadingButtonComponent],
    imports: [CommonModule, TranslateModule, IconModule, UtilityPipesModule],
    exports: [LoadingButtonComponent],
})
export class LoadingButtonModule {}
