import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ChangelogComponent } from './changelog/changelog.component';
import { FaqComponent } from './faq/faq.component';
import { FeaturesComponent } from './features/features.component';
import { HelpComponent } from './help/help.component';
import { LicensesComponent } from './licenses/licenses.component';
import { SupportComponent } from './support/support.component';

export const helpRoutes: CustomRoutes = [
    {
        path: '',
        data: {
            breadcrumb: {
                translate: _('routing.help'),
                icon: 'help',
            },
        },
        children: [
            {
                path: '',
                component: HelpComponent,
            },
            {
                path: 'faq',
                component: FaqComponent,
                data: {
                    breadcrumb: {
                        icon: 'faq',
                        translate: _('routing.faq'),
                    },
                },
            },
            {
                path: 'changelog',
                component: ChangelogComponent,
                data: {
                    breadcrumb: {
                        icon: 'changelog',
                        translate: _('routing.changelog'),
                    },
                },
            },
            {
                path: 'features',
                component: FeaturesComponent,
                data: {
                    breadcrumb: {
                        icon: 'features',
                        translate: _('routing.features'),
                    },
                },
            },
            {
                path: 'support',
                component: SupportComponent,
                data: {
                    breadcrumb: {
                        icon: 'support',
                        translate: _('routing.support'),
                    },
                },
            },
            {
                path: 'licenses',
                component: LicensesComponent,
                data: {
                    breadcrumb: {
                        icon: 'licenses',
                        translate: _('routing.licenses'),
                    },
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(helpRoutes)],
    exports: [RouterModule],
})
export class HelpRoutingModule {}
