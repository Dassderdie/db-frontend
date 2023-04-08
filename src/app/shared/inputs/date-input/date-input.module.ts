import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { deLocale } from 'ngx-bootstrap/locale';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DescriptionModule } from '../shared/description/description.module';
import { ValidationModule } from '../shared/validation/validation.module';
import { DateInputComponent } from './date-input.component';

// import the locals for the datepicker
defineLocale('de', deLocale);

@NgModule({
    declarations: [DateInputComponent],
    exports: [DateInputComponent],
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        UtilityPipesModule,
        FormsModule,
        PopoverModule.forRoot(),
        BsDatepickerModule.forRoot(),
        DirectivesModule,
        DisplayDateModule,
        ValidationModule,
        DescriptionModule,
    ],
    providers: [DatePipe],
})
export class DateInputModule {}
