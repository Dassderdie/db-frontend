import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    ChangeDetectorRef,
} from '@angular/core';
import type { Role } from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { EditableFiltersPreferences } from '../filter-utility/editable-filters-preferences';

@Component({
    selector: 'app-filter-preferences-manager-modal',
    templateUrl: './filter-preferences-manager-modal.component.html',
    styleUrls: ['./filter-preferences-manager-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPreferencesManagerModalComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    // must be set when opening the modal
    public projectId!: UUID;
    public tableId!: UUID;

    public filtersPreferences?: DeepWritable<Role['preferences']['filters']>;
    public updatingFiltersPreferences?: Promise<unknown>;

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly rolesService: RolesService
    ) {
        super();
    }

    ngOnInit() {
        this.rolesService
            .getRole(this.projectId)
            .pipe(takeUntil(this.destroyed))
            .subscribe((role) => {
                this.filtersPreferences = cloneDeepWritable(
                    role.preferences.filters
                );
                this.changeDetectorRef.markForCheck();
            });
    }

    public async moveFilterPreference(event: CdkDragDrop<string[]>) {
        if (
            event.previousIndex === event.currentIndex ||
            !this.filtersPreferences
        ) {
            return;
        }
        await this.updatingFiltersPreferences;
        this.filtersPreferences =
            EditableFiltersPreferences.moveFilterPreference(
                this.filtersPreferences,
                this.tableId,
                event.previousIndex,
                event.currentIndex
            );
        this.save();
    }

    public async removeFilterPreference(name: string) {
        if (!this.filtersPreferences) {
            return;
        }
        await this.updatingFiltersPreferences;
        this.filtersPreferences =
            EditableFiltersPreferences.removeFilterPreference(
                this.filtersPreferences,
                this.tableId,
                name
            );
        this.save();
    }

    public save() {
        if (!this.filtersPreferences) {
            return;
        }
        this.updatingFiltersPreferences =
            this.rolesService.editFiltersPreferences(
                this.projectId,
                this.filtersPreferences
            );
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
