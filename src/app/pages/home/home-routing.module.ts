import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { HomeComponent } from './home.component';

const routes: CustomRoutes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            { path: 'login', component: HomeComponent },
            { path: 'register', component: HomeComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HomeRoutingModule {}
