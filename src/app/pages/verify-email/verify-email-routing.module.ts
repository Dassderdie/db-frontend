import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { VerifyEmailComponent } from './verify-email.component';

const routes: CustomRoutes = [
    { path: '', component: VerifyEmailComponent, pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VerifyEmailRoutingModule {}
