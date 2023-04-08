import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { DisplayChangelogComponent } from './display-changelog.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        MainPipesModule,
        TranslateModule,
        DisplayDateModule,
        RouterModule,
    ],
    declarations: [DisplayChangelogComponent],
    exports: [DisplayChangelogComponent],
})
export class DisplayChangelogModule {}
