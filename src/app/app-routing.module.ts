import { NgModule } from '@angular/core';
import type { Route, UrlSegment } from '@angular/router';
import { RouterModule } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DelayedPreloadingStrategyService } from '@core/delayed-preloading-strategy/delayed-preloading-strategy.service';
import { HomeModule } from '@pages/home/home.module';
import { environment } from 'src/environments/environment';
import { AuthGuard } from './core/guards/auth/auth.guard';
import type { BreadcrumbRouteItem } from './feature/breadcrumb/breadcrumb-item';
import { AboutComponent } from './pages/about/about/about.component';

const routes: CustomRoutes = [
    {
        path: '',
        loadChildren: () => HomeModule,
        pathMatch: 'full',
    },
    {
        path: 'reset-password',
        loadChildren: async () =>
            import('./pages/reset-password/reset-password.module').then(
                (m) => m.PasswordResetModule
            ),
    },
    {
        path: 'change-authentication-email',
        canActivate: [AuthGuard],
        loadChildren: async () =>
            import(
                './pages/change-authentication-email/change-authentication-email.module'
            ).then((m) => m.ChangeAuthenticationEmailModule),
    },
    {
        path: 'verify-email',
        loadChildren: async () =>
            import('./pages/verify-email/verify-email.module').then(
                (m) => m.VerifyEmailModule
            ),
    },
    {
        path: 'scanner',
        canActivateChild: [AuthGuard],
        data: {
            breadcrumb: {
                translate: _('routing.scanner'),
                icon: 'scanner',
            },
        },
        loadChildren: async () =>
            import('./pages/scanner/scanner.module').then(
                (m) => m.ScannerModule
            ),
    },
    {
        path: 'projects',
        canActivateChild: [AuthGuard],
        data: {
            breadcrumb: {
                translate: _('routing.projects'),
                icon: 'projects',
            },
            preloadDelay: 5000,
        },
        loadChildren: async () =>
            import('./pages/projects/projects.module').then(
                (m) => m.ProjectsModule
            ),
    },
    {
        path: 'p',
        redirectTo: 'projects',
    },
    {
        path: 'about',
        component: AboutComponent,
        data: {
            breadcrumb: {
                translate: _('routing.about'),
                icon: 'about',
            },
        },
    },
    {
        path: 'help',
        loadChildren: async () =>
            import('./pages/help/help.module').then((m) => m.HelpModule),
    },
    {
        path: '',
        canActivateChild: [AuthGuard],
        loadChildren: async () =>
            import('./pages/users/users.module').then((m) => m.UsersModule),
    },
    {
        path: 'join-project',
        loadChildren: async () =>
            import('./pages/join-project/join-project.module').then(
                (m) => m.JoinProjectModule
            ),
    },
    {
        path: 'company-details',
        canLoad: ['canLoadCompanyDetails'],
        loadChildren: async () =>
            import('./pages/company-details/company-details.module').then(
                (m) => m.CompanyDetailsModule
            ),
    },
    {
        path: 'privacy-policy',
        canLoad: ['canLoadPrivacyPolicy'],
        loadChildren: async () =>
            import('./pages/privacy-policy/privacy-policy.module').then(
                (m) => m.PrivacyPolicyModule
            ),
    },
    {
        path: '**',
        loadChildren: async () =>
            import('./pages/error-404/error-404.module').then(
                (m) => m.Error404Module
            ),
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: DelayedPreloadingStrategyService,
            // TODO: Reactivate when there is a solution to not trigger scrolling after query change (search)
            // scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
        }),
    ],
    exports: [RouterModule],
    providers: [
        // See https://angular.io/api/router/CanLoad
        {
            provide: 'canLoadCompanyDetails',
            useValue: (route: Route, segments: UrlSegment[]) =>
                !!environment.companyDetails,
        },
        {
            provide: 'canLoadPrivacyPolicy',
            useValue: (route: Route, segments: UrlSegment[]) =>
                environment.hasPrivacyPolicy,
        },
    ],
})
export class AppRoutingModule {}

export type CustomRoutes = CustomRoute[];

export interface CustomRoute extends Route {
    data?: {
        breadcrumb?: BreadcrumbRouteItem;
        /**
         * in ms delay until the route should be preloaded
         * if undefined -> do not preload
         */
        preloadDelay?: number;
    };
    children?: CustomRoutes;
}
