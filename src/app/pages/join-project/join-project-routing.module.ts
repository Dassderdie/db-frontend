import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { JoinProjectComponent } from './join-project.component';

const routes: CustomRoutes = [
    { path: '', component: JoinProjectComponent, pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JoinProjectRoutingModule {}
