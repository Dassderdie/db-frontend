import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { RefreshUserGuard } from './refresh-user.guard';

export const usersRoutes: CustomRoutes = [
    {
        path: 'your-profile',
        canActivate: [RefreshUserGuard],
        data: {
            breadcrumb: {
                icon: 'user',
                value: 'yourProfile',
            },
        },
        component: ProfileComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(usersRoutes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
