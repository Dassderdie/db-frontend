import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Project } from '@cache-server/api/projects/project';
import type { Role } from '@cache-server/api/roles/role';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { UsersService } from '@core/cache-client/api/users/users.service';
import { I18nService } from '@core/utility/i18n/i18n.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { combineLatest } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { colors } from 'src/app/style-variables';

@Component({
    selector: 'app-project-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectOverviewComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    public searchText = '';

    public project?: Project;
    /**
     * all the tables in this project
     */
    public allTables?: ReadonlyArray<Table>;
    public unfilteredTables?: {
        readonly favoriteTables: ReadonlyArray<Table>;
        readonly normalTables: ReadonlyArray<Table>;
    };
    public filteredTables?: {
        readonly favoriteTables: ReadonlyArray<Table>;
        readonly normalTables: ReadonlyArray<Table>;
    };
    public favoritesAreUpdating = false;
    public ownRole?: Role;

    public readonly additionalGraphStyles: cytoscape.StylesheetStyle[] = [
        {
            selector: '.favorite',
            style: {
                'font-weight': 'bolder',
                'background-color': colors.primary,
                'background-opacity': 1,
                color: colors.white,
            },
        },
    ];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly projectsService: ProjectsService,
        private readonly tablesService: TablesService,
        private readonly i18nService: I18nService,
        private readonly rolesService: RolesService,
        private readonly usersService: UsersService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        const params$ = this.activatedRoute.params.pipe(
            map((params) => ({ projectId: params.project }))
        );
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.projectsService.getProject(projectId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((project) => {
                this.project = project;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId }) =>
                    this.usersService
                        .getUser()
                        .pipe(
                            switchMap((user) =>
                                combineLatest([
                                    this.rolesService.getRole(
                                        projectId,
                                        user.id
                                    ),
                                    this.tablesService.getTables(projectId),
                                ])
                            )
                        )
                ),
                takeUntil(this.destroyed)
            )
            .subscribe(([ownRole, allTables]) => {
                this.ownRole = ownRole;
                this.allTables = allTables;
                const favoriteTables =
                    this.ownRole.preferences.favoriteTables.map(
                        (tableId) =>
                            allTables.find((table) => table.id === tableId)!
                    );
                const normalTables = this.allTables.filter(
                    (table) =>
                        !ownRole.preferences.favoriteTables.includes(table.id)
                );
                this.unfilteredTables = {
                    favoriteTables,
                    normalTables,
                };
                this.updateFilteredTables();
                this.changeDetectorRef.markForCheck();
            });
    }

    public navigateToTable(tableId: UUID) {
        this.router.navigate([tableId], {
            relativeTo: this.activatedRoute,
        });
    }

    public updateFilteredTables() {
        if (!this.unfilteredTables) {
            errors.error({ message: 'unfilteredTables is not defined' });
            return;
        }
        const favoriteTables = this.unfilteredTables.favoriteTables.filter(
            (table) => this.filterMatchesTable(table)
        );
        const normalTables = this.unfilteredTables.normalTables.filter(
            (table) => this.filterMatchesTable(table)
        );
        this.filteredTables = {
            favoriteTables,
            normalTables,
        };
    }

    public moveFavorite(event: CdkDragDrop<ReadonlyArray<UUID>>) {
        if (
            event.previousIndex === event.currentIndex ||
            !this.filteredTables
        ) {
            return;
        }
        const newFavoriteTables = [...this.filteredTables.favoriteTables];
        // Change order in filteredTables to improve UX with slow internet connection
        moveItemInArray(
            newFavoriteTables,
            event.previousIndex,
            event.currentIndex
        );
        this.filteredTables = {
            ...this.filteredTables,
            favoriteTables: newFavoriteTables,
        };
        const newFavoriteTablesIds: UUID[] =
            this.filteredTables.favoriteTables.map((table) => table.id);
        errors.assert(!!this.project);
        this.rolesService
            .updateFavoriteTables(this.project.id, newFavoriteTablesIds)
            .then(() => {
                this.favoritesAreUpdating = false;
                this.changeDetectorRef.markForCheck();
            });
    }

    private filterMatchesTable(table: Table): boolean {
        const displayNames = this.i18nService.getLanguage(table.displayNames);
        return displayNames?.singular
            .toUpperCase()
            .includes(this.searchText.toUpperCase());
    }

    /**
     * Ads or removes a table from the favorite tables
     * @param tableId the id of the table that should be added or removed from the favoriteTables
     * @param favorite wether the table should now be added to the favoriteTables (true) or removed (false)
     */
    public changeFavoriteStatus(tableId: UUID, favorite: boolean) {
        if (!this.project || !this.unfilteredTables) {
            errors.error({
                message: 'project or unfilteredTables is not defined',
            });
            return;
        }
        const newFavoriteTablesIds: UUID[] =
            this.unfilteredTables.favoriteTables.map((table) => table.id);
        if (favorite) {
            newFavoriteTablesIds.push(tableId);
        } else {
            const tableIdIndex = newFavoriteTablesIds.indexOf(tableId);
            errors.assert(tableIdIndex >= 0, {
                status: 'throw',
                message: `the tableId ${tableId}can not get removed because it is not in the favoriteTables`,
            });
            newFavoriteTablesIds.splice(tableIdIndex, 1);
        }
        this.favoritesAreUpdating = true;
        this.rolesService
            .updateFavoriteTables(this.project.id, newFavoriteTablesIds)
            .then(() => {
                this.favoritesAreUpdating = false;
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
