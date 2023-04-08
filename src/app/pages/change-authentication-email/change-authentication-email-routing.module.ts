import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ChangeAuthenticationEmailComponent } from './change-authentication-email.component';

const routes: CustomRoutes = [
    {
        path: '',
        component: ChangeAuthenticationEmailComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ChangeAuthenticationEmailRoutingModule {}
