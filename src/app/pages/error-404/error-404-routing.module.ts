import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { Error404Component } from './error-404.component';

const routes: CustomRoutes = [
    { path: '', component: Error404Component, pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class Error404RoutingModule {}
