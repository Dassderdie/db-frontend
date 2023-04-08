import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputsModule } from '@shared/inputs/inputs.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { PasswordResetRoutingModule } from './reset-password-routing.module';
import { PasswordResetComponent } from './reset-password.component';

@NgModule({
    declarations: [PasswordResetComponent],
    imports: [
        CommonModule,
        PasswordResetRoutingModule,
        TranslateModule,
        InputsModule,
        LoadingButtonModule,
        UtilityPipesModule,
    ],
})
export class PasswordResetModule {}
