import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeactivationGuard } from '@core/guards/deactivation/deactivation.guard';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ChooseTableRouteComponent } from './pages/choose-table-route/choose-table-route.component';
import { CreateEntryComponent } from './pages/create-entry/create-entry.component';
import { EntrySearchComponent } from './pages/entry-search/entry-search.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { TableComponent } from './pages/table/table.component';

export const tablesRoutes: CustomRoutes = [
    {
        path: ':table',
        data: {
            breadcrumb: {
                icon: 'table',
                value: ':table',
                significant: true,
            },
        },
        component: TableComponent,
        children: [
            {
                path: '',
                component: ChooseTableRouteComponent,
                pathMatch: 'full',
            },
            {
                path: 'new',
                component: CreateEntryComponent,
                canDeactivate: [DeactivationGuard],
                data: {
                    breadcrumb: {
                        translate: _('routing.createEntry'),
                        icon: 'create',
                    },
                },
            },
            {
                path: 'search',
                component: EntrySearchComponent,
                canDeactivate: [DeactivationGuard],
                data: {
                    breadcrumb: {
                        translate: _('routing.search'),
                        icon: 'search',
                    },
                },
            },
            {
                path: 'statistics',
                component: StatisticsComponent,
                canDeactivate: [DeactivationGuard],
                data: {
                    breadcrumb: {
                        translate: _('routing.statistics'),
                        icon: 'statistics',
                    },
                },
            },
            { path: 'entries', redirectTo: '', pathMatch: 'full' },
            {
                path: 'e/:entry',
                redirectTo: 'entries/:entry',
            },
            {
                path: 'entries',
                data: {
                    preloadDelay: 0,
                },
                loadChildren: async () =>
                    import('./entries/entries.module').then(
                        (m) => m.EntriesModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(tablesRoutes)],
    exports: [RouterModule],
})
export class TablesRoutingModule {}
