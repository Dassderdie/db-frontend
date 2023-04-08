import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        RouterModule,
        TranslateModule,
        MainPipesModule,
    ],
    declarations: [BreadcrumbComponent],
    exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
