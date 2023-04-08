import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeactivationGuard } from '@core/guards/deactivation/deactivation.guard';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ChooseActionComponent } from './pages/choose-action/choose-action.component';
import { TableComponent } from './pages/table/table.component';
import { TablesComponent } from './pages/tables/tables.component';

export const tablesEditorRoutes: CustomRoutes = [
    {
        path: '',
        component: TablesComponent,
        canDeactivate: [DeactivationGuard],
        children: [
            {
                path: '',
                component: ChooseActionComponent,
                canDeactivate: [DeactivationGuard],
                pathMatch: 'full',
            },
            {
                path: ':table',
                component: TableComponent,
                canDeactivate: [DeactivationGuard],
                data: {
                    breadcrumb: {
                        value: ':table',
                        icon: 'table',
                    },
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(tablesEditorRoutes)],
    exports: [RouterModule],
})
export class TablesEditorRoutingModule {}
