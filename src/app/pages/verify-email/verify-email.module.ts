import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { VerifyEmailRoutingModule } from './verify-email-routing.module';
import { VerifyEmailComponent } from './verify-email.component';

@NgModule({
    declarations: [VerifyEmailComponent],
    imports: [
        CommonModule,
        IconModule,
        LoadingPlaceholderModule,
        VerifyEmailRoutingModule,
        TranslateModule,
    ],
})
export class VerifyEmailModule {}
