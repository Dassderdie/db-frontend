import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

@NgModule({
    declarations: [PrivacyPolicyComponent],
    imports: [
        CommonModule,
        PrivacyPolicyRoutingModule,
        IconModule,
        TranslateModule,
        LoadingPlaceholderModule,
    ],
})
export class PrivacyPolicyModule {}
