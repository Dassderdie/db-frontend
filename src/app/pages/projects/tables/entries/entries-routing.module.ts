import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeactivationGuard } from '@core/guards/deactivation/deactivation.guard';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ChooseEntryRouteComponent } from './pages/choose-entry-route/choose-entry-route.component';
import { EditEntryComponent } from './pages/edit-entry/edit-entry.component';
import { EntryHistoryComponent } from './pages/entry-history/entry-history.component';
import { EntryOverviewComponent } from './pages/entry-overview/entry-overview.component';
import { EntryComponent } from './pages/entry/entry.component';
import { EntryRelationExplorerComponent } from './pages/entry-relation-explorer/entry-relation-explorer.component';

const routes: CustomRoutes = [
    {
        path: ':entry',
        component: EntryComponent,
        data: {
            breadcrumb: {
                value: ':entry',
                icon: 'entry',
                significant: true,
            },
        },
        children: [
            {
                path: '',
                component: ChooseEntryRouteComponent,
                pathMatch: 'full',
            },
            {
                path: 'o',
                redirectTo: 'overview',
            },
            {
                path: 'overview',
                component: EntryOverviewComponent,
                data: {
                    breadcrumb: {
                        translate: _('routing.overview'),
                        icon: 'overview',
                        significant: false,
                    },
                },
            },
            {
                path: 'relation-explorer',
                component: EntryRelationExplorerComponent,
                data: {
                    breadcrumb: {
                        translate: _('routing.relation-explorer'),
                        icon: 'overview',
                        significant: false,
                    },
                },
            },
            {
                path: 'edit',
                component: EditEntryComponent,
                canDeactivate: [DeactivationGuard],
                data: {
                    breadcrumb: {
                        translate: _('routing.edit'),
                        icon: 'edit',
                        significant: false,
                    },
                },
            },
            {
                path: 'history',
                component: EntryHistoryComponent,
                data: {
                    breadcrumb: {
                        translate: _('routing.history'),
                        icon: 'history',
                        significant: false,
                    },
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EntriesRoutingModule {}
