import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { ShowMoreModule } from '@main-shared/show-more/show-more.module';
import { TranslateModule } from '@ngx-translate/core';
import { AlertsComponent } from './alerts/alerts.component';
import { MessageBodyComponent } from './message-body/message-body.component';
import { ToastsComponent } from './toasts/toasts.component';
import { CustomTimerProgressBarComponent } from './custom-timer-progress-bar/custom-timer-progress-bar.component';
import { LogToStringPipe } from './log-to-string.pipe';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        MainPipesModule,
        ShowMoreModule,
        IconModule,
    ],
    declarations: [
        AlertsComponent,
        ToastsComponent,
        MessageBodyComponent,
        CustomTimerProgressBarComponent,
        LogToStringPipe,
    ],
    exports: [AlertsComponent, ToastsComponent],
})
export class MessagesModule {}
