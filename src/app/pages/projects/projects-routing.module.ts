import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeactivationGuard } from '@core/guards/deactivation/deactivation.guard';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { EditPermissionsGuard } from './core/edit-permissions.guard';
import { ChooseProjectRouteComponent } from './pages/choose-project-route/choose-project-route.component';
import { GeneralProjectSettingsComponent } from './pages/general-settings/general-settings.component';
import { ProjectListComponent } from './pages/list/list.component';
import { MemberComponent } from './pages/member/member.component';
import { MembersComponent } from './pages/members/members.component';
import { ProjectOverviewComponent } from './pages/overview/overview.component';

export const projectsRoutes: CustomRoutes = [
    {
        path: '',
        component: ProjectListComponent,
        pathMatch: 'full',
    },
    {
        path: ':project',
        data: {
            breadcrumb: {
                value: ':project',
                icon: 'project',
                significant: true,
            },
        },
        children: [
            {
                path: '',
                component: ChooseProjectRouteComponent,
                pathMatch: 'full',
            },
            {
                path: 'tables',
                pathMatch: 'full',
                component: ProjectOverviewComponent,
                data: {
                    breadcrumb: {
                        translate: _('routing.project-overview'),
                        icon: 'project-overview',
                    },
                },
            },
            {
                path: 'tables',
                data: {
                    breadcrumb: {
                        translate: _('routing.project-overview'),
                        icon: 'project-overview',
                    },
                    preloadDelay: 0,
                },
                loadChildren: async () =>
                    import('./tables/tables.module').then(
                        (m) => m.TablesModule
                    ),
            },
            {
                path: 't',
                redirectTo: 'tables',
            },
            {
                path: 'settings',
                children: [
                    {
                        path: 'general',
                        component: GeneralProjectSettingsComponent,
                        canDeactivate: [DeactivationGuard],
                        data: {
                            breadcrumb: {
                                translate: _('routing.general-settings'),
                                icon: 'settings',
                            },
                        },
                    },
                    {
                        path: 'members',
                        data: {
                            breadcrumb: {
                                translate: _('routing.members'),
                                icon: 'users',
                            },
                        },
                        children: [
                            {
                                path: '',
                                component: MembersComponent,
                                pathMatch: 'full',
                            },
                            {
                                path: ':member',
                                component: MemberComponent,
                                canDeactivate: [DeactivationGuard],
                                canActivate: [EditPermissionsGuard],
                                data: {
                                    breadcrumb: {
                                        icon: 'user',
                                        value: ':member',
                                        significant: true,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        path: 'tables',
                        data: {
                            breadcrumb: {
                                translate: _('routing.tables-editor'),
                                icon: 'tables-editor',
                            },
                        },
                        loadChildren: async () =>
                            import('./tables-editor/tables-editor.module').then(
                                (m) => m.TablesEditorModule
                            ),
                    },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(projectsRoutes)],
    exports: [RouterModule],
})
export class ProjectsRoutingModule {}
