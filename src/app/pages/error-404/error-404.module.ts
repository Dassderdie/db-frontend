import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Error404RoutingModule } from './error-404-routing.module';
import { Error404Component } from './error-404.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        Error404RoutingModule,
    ],
    declarations: [Error404Component],
})
export class Error404Module {}
