import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { DateTimeInputComponent } from './date-time-input.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        IconModule,
        BsDropdownModule.forRoot(),
        DirectivesModule,
        ValidationModule,
        DescriptionModule,
    ],
    declarations: [DateTimeInputComponent],
    exports: [DateTimeInputComponent],
})
export class DateTimeInputModule {}
