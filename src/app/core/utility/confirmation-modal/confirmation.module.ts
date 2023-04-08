import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InputsModule } from 'src/app/shared/inputs/inputs.module';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        ModalModule.forRoot(),
        InputsModule,
    ],
    declarations: [ConfirmationModalComponent],
})
export class ConfirmationModule {}
