import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { FilterPreference, Role } from '@cache-server/api/roles/role';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { FilterQueryStorage } from '@tables/shared/search-versions/versions-filter-editor/filter-query-storage';
import type { Observable } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-choose-table-route',
    templateUrl: './choose-table-route.component.html',
    styleUrls: ['./choose-table-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseTableRouteComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    public readonly breakpoints = Breakpoints;
    public table?: Table;
    public role?: Role;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        private readonly router: Router,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly rolesService: RolesService
    ) {
        super();
    }

    ngOnInit() {
        const params$ = this.activatedRoute.params as Observable<{
            project: UUID;
            table: UUID;
        }>;
        params$
            .pipe(
                switchMap((params) =>
                    this.tablesService.getTable(params.project, params.table)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap((params) =>
                    this.rolesService.getRole(params.project)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((role) => {
                this.role = role;
            });
    }

    public async navigateToSearch(filterPreference: FilterPreference) {
        this.router.navigate(['search'], {
            relativeTo: this.activatedRoute,
            queryParams: await FilterQueryStorage.getQueryParams(
                filterPreference.filter,
                this.table!
            ),
            queryParamsHandling: 'merge',
            replaceUrl: false,
        });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
