import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { PasswordResetComponent } from './reset-password.component';

const routes: CustomRoutes = [
    { path: '', component: PasswordResetComponent, pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PasswordResetRoutingModule {}
