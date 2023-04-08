import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyDetailsRoutingModule } from './company-details-routing.module';
import { CompanyDetailsComponent } from './company-details.component';

@NgModule({
    declarations: [CompanyDetailsComponent],
    imports: [
        CommonModule,
        CompanyDetailsRoutingModule,
        IconModule,
        TranslateModule,
    ],
})
export class CompanyDetailsModule {}
