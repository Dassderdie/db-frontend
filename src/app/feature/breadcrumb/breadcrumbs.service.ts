import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type { ParamMap } from '@angular/router';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { isEqual } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, concat, of, ReplaySubject } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    first,
    map,
    switchMap,
} from 'rxjs/operators';
import type { BreadcrumbRouteItem } from './breadcrumb-item';
import { BreadcrumbItem } from './breadcrumb-item';

@Injectable({
    providedIn: 'root',
})
export class BreadcrumbsService {
    private readonly breadcrumbsE$ = new ReplaySubject<BreadcrumbItem[]>(1);
    public readonly breadcrumbs$ = this.breadcrumbsE$.asObservable();

    private readonly firstBreadcrumbItem: BreadcrumbItem = {
        path: '',
        translate: _('routing.home'),
        value$: undefined,
        icon: 'home',
        significant: false,
        titleName: 'KoppaDb',
    };
    private readonly maxLastSignifikantBreadcrumbLength = 10;

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly projectsService: ProjectsService,
        private readonly tablesService: TablesService,
        private readonly rolesService: RolesService,
        private readonly i18nService: I18nService,
        private readonly versionsService: VersionsService,
        private readonly usersService: UsersService,
        private readonly translateService: TranslateService,
        private readonly titleService: Title
    ) {
        this.createBreadcrumbStream().subscribe(this.breadcrumbsE$);
        // set the correct title
        this.breadcrumbsE$
            .pipe(
                switchMap((breadcrumbs) => {
                    // the most specific breadcrumb and the last significant one should be shown
                    const lastSignifikantBreadcrumb = breadcrumbs
                        // copy the array, because reverse() works on the referenced one directly
                        // lastSignifikantBreadcrumb should also be !== lastBreadcrumb
                        .slice(0, -1)
                        .reverse()
                        .find((breadcrumb) => breadcrumb.significant);
                    // breadcrumbs is  never empty
                    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
                    if (lastSignifikantBreadcrumb) {
                        return combineLatest([
                            this.getTitle(lastSignifikantBreadcrumb).pipe(
                                map((title) => {
                                    if (
                                        title.length >
                                        this.maxLastSignifikantBreadcrumbLength
                                    ) {
                                        return `${title.slice(
                                            0,
                                            this
                                                .maxLastSignifikantBreadcrumbLength
                                        )}…`;
                                    }
                                    return title;
                                })
                            ),
                            this.getTitle(lastBreadcrumb),
                        ]).pipe(map((titles) => titles.join(' - ')));
                    }
                    return this.getTitle(lastBreadcrumb);
                }),
                distinctUntilChanged()
            )
            .subscribe(
                (newTitle) => {
                    this.titleService.setTitle(newTitle);
                },
                (error: any) => errors.error(error)
            );
    }

    private getTitle(
        breadcrumb: BreadcrumbItem | undefined
    ): Observable<string> {
        const titlePartsS: Observable<string | null | undefined>[] = [];
        if (breadcrumb?.titleName) {
            titlePartsS.push(of(breadcrumb?.titleName));
        } else if (breadcrumb?.translate) {
            titlePartsS.push(this.translateService.get(breadcrumb.translate));
        }
        if (breadcrumb?.value$) {
            titlePartsS.push(breadcrumb.value$);
        }
        return combineLatest(titlePartsS).pipe(
            map((titleParts) => titleParts.filter((part) => !!part).join(' '))
        );
    }

    private createBreadcrumbStream() {
        return this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map((currentRoute) => {
                // Get all activated routes
                let routeSection = currentRoute;
                const routeSections: ActivatedRoute[] = [];
                const paramsObservables: Observable<ParamMap>[] = [];
                while (routeSection.firstChild) {
                    paramsObservables.push(routeSection.paramMap);
                    routeSections.push(routeSection);
                    routeSection = routeSection.firstChild;
                }
                paramsObservables.push(routeSection.paramMap);
                routeSections.push(routeSection);
                return {
                    routeSections,
                    params$: this.createParamsObservable(paramsObservables),
                };
            }),
            map(({ routeSections, params$ }) => {
                // Create breadcrumbs
                let absolutePathE$ = of('');
                const breadCrumbSections: Observable<{
                    breadcrumbRouteItem?: BreadcrumbRouteItem;
                    path: string;
                }>[] = [];
                for (const route of routeSections) {
                    const relativePathE$ = route.url.pipe(
                        map((urlSegments) =>
                            urlSegments
                                .filter((urlSegment) => urlSegment.path)
                                .map((urlSegment) => `/${urlSegment.path}`)
                                .join('')
                        )
                    );
                    const currentPathE$ = combineLatest([
                        absolutePathE$,
                        relativePathE$,
                    ]).pipe(
                        map(
                            ([absolutePath, relativePath]) =>
                                absolutePath + relativePath
                        )
                    );
                    absolutePathE$ = currentPathE$;
                    if (!route.data) {
                        continue;
                    }
                    breadCrumbSections.push(
                        combineLatest([
                            currentPathE$,
                            route.data.pipe(
                                first(),
                                map((data) => data.breadcrumb)
                            ),
                        ]).pipe(
                            map(([path, breadcrumbRouteItem]) => ({
                                path,
                                breadcrumbRouteItem,
                            }))
                        )
                    );
                }
                return { breadCrumbSections, params$ };
            }),
            switchMap(({ breadCrumbSections, params$ }) =>
                concat(
                    of([this.firstBreadcrumbItem]),
                    combineLatest(breadCrumbSections).pipe(
                        map(
                            (breadcrumbsSec) =>
                                breadcrumbsSec.filter(
                                    (breadcrumb, index) =>
                                        !!breadcrumb.breadcrumbRouteItem &&
                                        // remove consecutive breadcrumbItems with the same values (caused by Inheritance of data to componentless-routes)
                                        (index === 0 ||
                                            !isEqual(
                                                breadcrumb.breadcrumbRouteItem,
                                                breadcrumbsSec[index - 1]!
                                                    .breadcrumbRouteItem
                                            ))
                                ) as {
                                    breadcrumbRouteItem: BreadcrumbRouteItem;
                                    path: string;
                                }[]
                        ),
                        map((breadcrumbs2) => [
                            this.firstBreadcrumbItem,
                            ...breadcrumbs2.map(
                                ({ path, breadcrumbRouteItem }) =>
                                    new BreadcrumbItem(
                                        path,
                                        this.generateBreadcrumbValue(
                                            params$,
                                            breadcrumbRouteItem.value
                                        ),
                                        breadcrumbRouteItem.translate,
                                        breadcrumbRouteItem.icon,
                                        breadcrumbRouteItem.significant
                                    )
                            ),
                        ])
                    )
                )
            )
        );
    }

    /**
     *  @returns Observable of all params of all activated routes
     */
    private createParamsObservable(paramsObservables: Observable<ParamMap>[]) {
        return combineLatest(paramsObservables).pipe(
            map((paramMaps) => {
                const paramsValue: { [key: string]: unknown } = {};
                for (const paramMap of paramMaps) {
                    for (const key of paramMap.keys) {
                        errors.assert(
                            !paramsValue[key] ||
                                paramsValue[key] === paramMap.get(key),
                            {
                                status: 'logWarning',
                                message: `${key} was already assigned before`,
                                logValues: {
                                    paramsValue,
                                    paramMap,
                                },
                            }
                        );
                        paramsValue[key] = paramMap.get(key);
                    }
                }
                return paramsValue;
            })
        );
    }

    /**
     * converts the value key of a breadcrumbRouteItem to the actual value observable
     */
    private generateBreadcrumbValue(
        /**
         * Observable of all params of all activated routes
         */
        params$: Observable<{
            [key: string]: any;
        }>,
        key?: BreadcrumbRouteItem['value']
    ): Observable<string | null | undefined> | undefined {
        switch (key) {
            case ':project':
                return params$.pipe(
                    switchMap((paramsValue) => {
                        if (paramsValue?.project) {
                            return this.projectsService
                                .getProject(paramsValue.project)
                                .pipe(map((project) => project.name));
                        }
                        errors.error({
                            message: 'Parameter "project" is not defined',
                        });
                        return of('');
                    })
                );
            case ':table':
                return params$.pipe(
                    switchMap((paramsValue) => {
                        if (paramsValue?.project && paramsValue.table) {
                            if (paramsValue.table !== 'new') {
                                return this.tablesService
                                    .getTable(
                                        paramsValue.project,
                                        paramsValue.table
                                    )
                                    .pipe(
                                        map(
                                            (table) =>
                                                this.i18nService.getLanguage(
                                                    table.displayNames
                                                )?.singular
                                        )
                                    );
                            }
                            return of('???');
                        }
                        errors.error({
                            message:
                                'Parameter "project" or "table" is not defined',
                        });
                        return of('');
                    })
                );
            case ':member':
                return params$.pipe(
                    switchMap((paramsValue) => {
                        if (paramsValue?.project && paramsValue.member) {
                            return this.rolesService
                                .getRole(
                                    paramsValue.project,
                                    paramsValue.member
                                )
                                .pipe(
                                    map((role) =>
                                        role.user ? role.user.name : '???'
                                    )
                                );
                        }
                        errors.error({
                            message:
                                'Parameter "project" or "member" is not defined',
                        });
                        return of('');
                    })
                );
            case ':entry':
                // Representative the newestVersion
                return params$.pipe(
                    switchMap((paramsValue) => {
                        if (
                            paramsValue?.project &&
                            paramsValue.table &&
                            paramsValue.entry
                        ) {
                            return combineLatest([
                                this.versionsService.getNewestVersion(
                                    paramsValue.project,
                                    paramsValue.table,
                                    paramsValue.entry
                                ),
                                this.tablesService.getTable(
                                    paramsValue.project,
                                    paramsValue.table
                                ),
                            ]).pipe(
                                map(
                                    ([version, table]) =>
                                        (version?.values[
                                            table.attributes[0]!.id
                                        ] as string) || '???'
                                )
                            );
                        }
                        errors.error({
                            message:
                                'Parameter "project" or "table" or "entry" is not defined',
                        });
                        return of('');
                    })
                );
            case 'yourProfile':
                return this.usersService
                    .getUser()
                    .pipe(map((user) => user.name));
            default:
                errors.assert(!key, {
                    status: 'error',
                    message: `Unknown value parameter: ${key}`,
                });
        }
        return undefined;
    }
}
