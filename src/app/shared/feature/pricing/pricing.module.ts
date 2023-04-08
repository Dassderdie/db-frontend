import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { PricingComponent } from './pricing.component';

@NgModule({
    declarations: [PricingComponent],
    imports: [CommonModule, TranslateModule, IconModule],
    exports: [PricingComponent],
})
export class PricingModule {}
