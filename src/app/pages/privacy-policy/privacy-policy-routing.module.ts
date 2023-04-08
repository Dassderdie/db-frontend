import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

const routes: CustomRoutes = [{ path: '', component: PrivacyPolicyComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PrivacyPolicyRoutingModule {}
