import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { AnonymousButtonComponent } from './anonymous-button.component';

@NgModule({
    declarations: [AnonymousButtonComponent],
    imports: [
        CommonModule,
        LoadingButtonModule,
        IconModule,
        TranslateModule,
        DirectivesModule,
    ],
    exports: [AnonymousButtonComponent],
})
export class AnonymousButtonModule {}
