import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NavigationColComponent } from './navigation-col.component';

@NgModule({
    declarations: [NavigationColComponent],
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        IconModule,
        DirectivesModule,
        MainPipesModule,
    ],
    exports: [NavigationColComponent],
})
export class NavigationColModule {}
