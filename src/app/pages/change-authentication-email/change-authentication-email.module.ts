import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SelectInputModule } from '@shared/inputs/select-input/select-input.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { ChangeAuthenticationEmailRoutingModule } from './change-authentication-email-routing.module';
import { ChangeAuthenticationEmailComponent } from './change-authentication-email.component';

@NgModule({
    declarations: [ChangeAuthenticationEmailComponent],
    imports: [
        CommonModule,
        ChangeAuthenticationEmailRoutingModule,
        TranslateModule,
        SelectInputModule,
        LoadingButtonModule,
    ],
})
export class ChangeAuthenticationEmailModule {}
