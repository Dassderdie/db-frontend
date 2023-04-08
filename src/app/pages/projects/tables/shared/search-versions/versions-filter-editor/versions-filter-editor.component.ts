import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    Output,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from '@cache-server/api/tables/table';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import { MessageService } from '@core/utility/messages/message.service';
import { QueryNavigatorService } from '@core/utility/query-navigator/query-navigator.service';
import { CheckboxInput } from '@shared/inputs/checkbox-input/checkbox-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { QueryStorage } from '@shared/versions/versions-list/utilities/query-storage';
import { isEqual } from 'lodash-es';
import { first, map, take, takeUntil } from 'rxjs/operators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type {
    FilterPreference,
    FiltersPreferences,
} from '@cache-server/api/roles/role';
import { maximumNumberOfFilterPreferences } from '@cache-server/api/roles/role';
import { combineLatest } from 'rxjs';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { State } from '@shared/utility/classes/state/state';
import { convertEditableFilterToCleanedFilter } from '../filter-utility/convert-editable-to-cleaned-filter';
import { convertNormalToAdvancedFilter } from '../filter-utility/convert-normal-to-advanced-filter';
import { convertAdvancedToNormalFilter } from '../filter-utility/convert-advanced-to-normal-filter';
import { appliedFilterIsAdvancedFilter } from '../filter-utility/applied-filter-is-advanced-filter';
import { defaultFilter } from '../filter-utility/normal-wrap-filter';
import { convertCleanedFilterToAdvancedFilter } from '../filter-utility/convert-cleaned-filter-to-advanced-filter';
import { EditableFiltersPreferences } from '../filter-utility/editable-filters-preferences';
import type { EditableFilterGroup } from '../filter-utility/editable-filter-group';
import { convertFilterToEditableFilter } from '../filter-utility/convert-filter-to-editable-filter';
import { createNewFilterPreference } from '../create-new-filter-preference-modal/create-new-filter-preference';
import { FilterQueryStorage } from './filter-query-storage';

@Component({
    selector: 'app-versions-filter-editor',
    templateUrl: './versions-filter-editor.component.html',
    styleUrls: ['./versions-filter-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays an ui for creating a filter that will be passed to the parent component
 * it saves this filter in the url-query (bookmarks, reloading etc...)
 */
export class VersionsFilterEditorComponent
    extends Destroyed
    implements OnDestroy, OnChanges, OnInit
{
    @Input() table!: Table;
    /**
     * emits the new filter that should be applied
     */
    @Output() readonly appliedFilterChanges = new EventEmitter<string | null>();

    /**
     * the filter that should be send to the backend and has been emitted last by appliedFilterChanges
     */
    public appliedFilter?: FilterGroup | null;
    /**
     * the filter that is currently displayed and can be edited
     */
    public get filter() {
        return this.isAdvancedModeControl.value
            ? this.currentFilter?.advanced
            : this.currentFilter?.normal;
    }
    public currentFilter?: {
        /**
         * This filter has the normalWrapFilter applied
         */
        normal: EditableFilterGroup;
        /**
         * this filter is the "full" one
         */
        advanced: EditableFilterGroup;
        /**
         * this filter is the cleaned variant of the appliedFilter - it should be send to the backend and be saved in the query
         */
        cleaned: FilterGroup | null;
        /**
         * Wether the current filter is equal to the defaultFilter
         */
        isDefaultFilter: boolean;
    };
    /**
     * wether the first filterGroup should be collapsed (or shown) at the start
     */
    public initiallyCollapseFilterGroup?: boolean;

    public readonly filterPreferencesState = new State<unknown>(
        undefined,
        () =>
            !!this.selectedFilterPreference &&
            !isEqual(
                this.selectedFilterPreference.filter,
                this.currentFilter?.cleaned
            )
    );
    /**
     * wether the filter was the latest emit from appliedFilterChanges
     */
    public filterIsApplied = false;
    private filterStorage!: QueryStorage<FilterGroup | null>;
    /**
     * if the advancedMode is activated the filter will be applied only cleaned and the user can add expressions with metaAttributes
     * else the filter will be wrapped in the normal-wrap-filter and then cleaned
     */
    public readonly isAdvancedModeControl = new CheckboxInput(
        'advancedOptions',
        false,
        _('pages.entries.filter.advanced-mode.name'),
        'translate',
        {
            description: _('pages.entries.filter.advanced-mode.descriptions'),
            firstCurrentValue: false,
        }
    );

    /**
     * The (advanced) filter from the preferences that is currently selected
     */
    public selectedFilterPreference?: FilterPreference;
    /**
     * After a new filter has been created or updated, it should be selected next - this variable is for this feature
     */
    public nextSelectedFilterPreferenceName?: string;
    /**
     * The filter preferences
     * `undefined` - still loading
     * if filtersPreferences[this.table.id] is undefined - no preferences have been saved yet
     */
    public filtersPreferences?: FiltersPreferences;
    /**
     * Wether the currentFilter.cleaned is different from the selectedFilterPreference
     * `undefined` - the selectedFilterPreference is undefined
     */
    public selectedFilterPreferenceHasChanges?: boolean;
    public maximumNumberOfFilterPreferences = maximumNumberOfFilterPreferences;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly queryNavigatorService: QueryNavigatorService,
        private readonly messageService: MessageService,
        private readonly rolesService: RolesService,
        private readonly modalService: BsModalService,
        private readonly translateService: TranslateService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.filterStorage = new QueryStorage<FilterGroup | null>(
            FilterQueryStorage.getKey(this.table),
            this.activatedRoute,
            this.queryNavigatorService,
            this.messageService,
            FilterQueryStorage.queryToValueConverter,
            FilterQueryStorage.valueToQueryConverter
        );
        const preferenceFilters$ = this.rolesService
            .getRole(this.table.projectId)
            .pipe(map((role) => role.preferences.filters));
        preferenceFilters$
            .pipe(takeUntil(this.destroyed))
            .subscribe((preferenceFilters) => {
                this.filtersPreferences = preferenceFilters;
                if (this.nextSelectedFilterPreferenceName) {
                    this.selectFilterPreference(
                        this.nextSelectedFilterPreferenceName
                    );
                    this.nextSelectedFilterPreferenceName = undefined;
                    this.changeDetectorRef.markForCheck();
                    return;
                }
                if (
                    this.selectedFilterPreference &&
                    !this.selectedFilterPreferenceHasChanges
                ) {
                    this.selectFilterPreference(
                        this.selectedFilterPreference.name
                    );
                    this.changeDetectorRef.markForCheck();
                    return;
                }
                this.filterPreferencesState.updateState(true, true);
                this.changeDetectorRef.markForCheck();
            });
        let isFirstFilterFromQuery = true;
        combineLatest([
            preferenceFilters$.pipe(first()),
            this.filterStorage.value$.pipe(
                map(convertCleanedFilterToAdvancedFilter)
            ),
        ])
            .pipe(takeUntil(this.destroyed))
            .subscribe(([filtersPreferences, newFilterFromQuery]) => {
                const firstFilterPreference =
                    filtersPreferences[this.table.id]?.[0];
                if (
                    // TODO: this means it isn't possible to share the defaultFilter (via link)?
                    isFirstFilterFromQuery &&
                    isEqual(newFilterFromQuery, defaultFilter) &&
                    firstFilterPreference
                ) {
                    this.selectFilterPreference(firstFilterPreference.name);
                    this.initiallyCollapseFilterGroup = true;
                } else {
                    // the filter saved in the query is always saved in an advanced format
                    this.setFilterAdvanced(newFilterFromQuery);
                }
                if (isFirstFilterFromQuery) {
                    isFirstFilterFromQuery = false;
                    const filterIsAdvanced =
                        appliedFilterIsAdvancedFilter(newFilterFromQuery);
                    this.isAdvancedModeControl.setValue(filterIsAdvanced);
                    this.initiallyCollapseFilterGroup = true;
                    // check wether the first filter is equivalent to one of the users preferences - if so select it
                    // this is a workaround to link to one of ones own filters directly from e.g. the table overview
                    this.selectedFilterPreference = filtersPreferences[
                        this.table.id
                    ]?.find((filterPreference) =>
                        isEqual(
                            filterPreference.filter,
                            this.currentFilter?.cleaned
                        )
                    );
                    // The first filter that is retrieved from the query should automatically get applied
                    this.applyFilter();
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.table && !changes.table.isFirstChange()) {
            errors.assert(
                changes.table.currentValue.id === changes.table.previousValue.id
            );
            if (this.currentFilter?.cleaned) {
                this.setFilterAdvanced(this.currentFilter.cleaned);
            }
        }
    }

    public selectFilterPreference(name: string) {
        this.selectedFilterPreference = this.filtersPreferences?.[
            this.table.id
        ]?.find((filterPreference) => filterPreference.name === name);
        if (!this.selectedFilterPreference) {
            this.messageService.postMessage(
                {
                    title: _(
                        'pages.entries.filter.not-available-anymore-message.title'
                    ),
                    color: 'warning',
                },
                'toast'
            );
            return;
        }
        this.setFilterAdvanced(
            convertCleanedFilterToAdvancedFilter(
                this.selectedFilterPreference.filter
            )
        );
        this.applyFilter();
    }

    public saveCurrentFilter() {
        errors.assert(
            !!this.selectedFilterPreference &&
                !!this.filtersPreferences &&
                !!this.currentFilter
        );
        const newFiltersPreferences =
            EditableFiltersPreferences.updateFilterPreference(
                this.filtersPreferences,
                this.table.id,
                this.selectedFilterPreference.name,
                this.currentFilter.cleaned
            );
        this.nextSelectedFilterPreferenceName =
            this.selectedFilterPreference.name;
        this.rolesService.editFiltersPreferences(
            this.table.projectId,
            newFiltersPreferences
        );
    }

    public resetCurrentFilter() {
        errors.assert(!!this.selectedFilterPreference);
        this.setFilterAdvanced(
            convertCleanedFilterToAdvancedFilter(
                this.selectedFilterPreference.filter
            )
        );
    }

    public addFilterPreference() {
        createNewFilterPreference(
            this.table,
            this.currentFilter!.cleaned,
            this.modalService
        )
            .pipe(take(1), takeUntil(this.destroyed))
            // eslint-disable-next-line rxjs/no-async-subscribe
            .subscribe(async (newFilterPreference) => {
                errors.assert(
                    !!this.filtersPreferences && !!this.currentFilter
                );
                const newFiltersPreferences =
                    await EditableFiltersPreferences.addFilterPreference(
                        this.filtersPreferences,
                        newFilterPreference,
                        this.table.id,
                        this.translateService
                    );
                this.nextSelectedFilterPreferenceName =
                    newFilterPreference.name;
                this.rolesService.editFiltersPreferences(
                    this.table.projectId,
                    newFiltersPreferences
                );
            });
    }

    /**
     * sets the new filter
     * @param newAdvancedFilter the new filter
     */
    private setFilterAdvanced(newAdvancedFilter: FilterGroup) {
        this.setCurrentFilter({
            normal: convertFilterToEditableFilter(
                convertAdvancedToNormalFilter(newAdvancedFilter),
                this.table.attributes
            ),
            advanced: convertFilterToEditableFilter(
                newAdvancedFilter,
                this.table.attributes
            ),
        });
    }

    public setFilterEditable(newEditableFilter: EditableFilterGroup) {
        const advancedOrNormalFilter = convertCleanedFilterToAdvancedFilter(
            convertEditableFilterToCleanedFilter(newEditableFilter)
        );
        const advanced = this.isAdvancedModeControl.value
            ? newEditableFilter
            : convertFilterToEditableFilter(
                  convertNormalToAdvancedFilter(advancedOrNormalFilter),
                  this.table.attributes
              );
        this.setCurrentFilter({
            normal: this.isAdvancedModeControl.value
                ? convertFilterToEditableFilter(
                      convertAdvancedToNormalFilter(advancedOrNormalFilter),
                      this.table.attributes
                  )
                : newEditableFilter,
            advanced,
        });
    }

    private setCurrentFilter(newFilters: {
        normal: EditableFilterGroup;
        advanced: EditableFilterGroup;
    }) {
        const cleaned = convertEditableFilterToCleanedFilter(
            newFilters.advanced
        );
        this.currentFilter = {
            ...newFilters,
            cleaned,
            isDefaultFilter: isEqual(defaultFilter, cleaned),
        };
        this.filterIsApplied = isEqual(
            this.appliedFilter,
            this.currentFilter.cleaned
        );
        this.filterPreferencesState.updateState(true, true);
    }

    /**
     * applies the newestFilter (save in url-query, emit)
     */
    public applyFilter() {
        this.appliedFilter = this.currentFilter!.cleaned;
        this.filterIsApplied = true;
        this.appliedFilterChanges.emit(JSON.stringify(this.appliedFilter));
        this.filterStorage.setValue(this.appliedFilter);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.isAdvancedModeControl.destroy();
        this.filterStorage.destroy();
    }
}
