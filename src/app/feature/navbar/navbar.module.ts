import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NavbarComponent } from './navbar.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        BsDropdownModule.forRoot(),
        CollapseModule.forRoot(),
        TranslateModule,
        RouterModule,
        MainPipesModule,
    ],
    declarations: [NavbarComponent],
    exports: [NavbarComponent],
})
export class NavbarModule {}
