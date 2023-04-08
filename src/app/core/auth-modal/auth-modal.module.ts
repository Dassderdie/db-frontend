import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { StringInputModule } from '@shared/inputs/string-input/string-input.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { EmailVerificationModalComponent } from './email-verification-modal/email-verification-modal.component';

@NgModule({
    imports: [
        CommonModule,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        TranslateModule,
        StringInputModule,
        RouterModule,
        IconModule,
        UtilityPipesModule,
        LoadingButtonModule,
    ],
    declarations: [AuthModalComponent, EmailVerificationModalComponent],
})
export class AuthModalModule {}
