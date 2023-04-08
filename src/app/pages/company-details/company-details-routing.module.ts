import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { CompanyDetailsComponent } from './company-details.component';

const routes: CustomRoutes = [
    {
        path: '',
        component: CompanyDetailsComponent,
        data: {
            breadcrumb: {
                translate: _('routing.company-details'),
                icon: 'info',
            },
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CompanyDetailsRoutingModule {}
