import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { DirectivesModule } from '@shared/directives/directives.module';
import { DateTimeFormatterPipe } from './date-time-formatter.pipe';
import { DisplayDateComponent } from './display-date/display-date.component';
import { RelativeTimeFormatPipe } from './relative-time-format.pipe';

@NgModule({
    imports: [CommonModule, DirectivesModule, MainPipesModule],
    declarations: [
        DisplayDateComponent,
        DateTimeFormatterPipe,
        RelativeTimeFormatPipe,
    ],
    exports: [DisplayDateComponent, DateTimeFormatterPipe],
})
export class DisplayDateModule {}
