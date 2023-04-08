import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Form } from '@shared/inputs/form';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { map } from 'rxjs/operators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Table } from '@cache-server/api/tables/table';
import type { FilterGroup } from '@cache-server/api/versions/filter-group';
import type { FilterPreference } from '@cache-server/api/roles/role';
import { Subject } from 'rxjs';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import type { AsyncValidator } from '@shared/utility/classes/state/validator-state';

@Component({
    selector: 'app-create-new-filter-preference-modal',
    templateUrl: './create-new-filter-preference-modal.component.html',
    styleUrls: ['./create-new-filter-preference-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNewFilterPreferenceModalComponent implements OnInit {
    public filter!: FilterGroup | null;
    public table!: Table;
    public readonly newFilterPreference$ = new Subject<FilterPreference>();

    public newFilterPreferenceForm?: ReturnType<this['createFilterForm']>;

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly rolesService: RolesService
    ) {}

    ngOnInit() {
        // initialize here, because the modalService injects the values here
        this.newFilterPreferenceForm = this.createFilterForm() as ReturnType<
            this['createFilterForm']
        >;
    }

    // public only to use it as type parameter
    public createFilterForm() {
        return new Form([
            new StringInput('name', null, {
                validators: [CustomValidators.required()],
                asyncValidators: [this.uniqueValidator],
            }),
        ] as const);
    }

    private readonly uniqueValidator: AsyncValidator<string | null> = (
        newName
    ) =>
        this.rolesService.getRole(this.table.projectId).pipe(
            map((role) =>
                role.preferences.filters[this.table.id]?.some(
                    (filterPreference) => filterPreference.name === newName
                )
                    ? {
                          unique: {
                              value: newName,
                              translationKey: _(
                                  'pages.entries.new-filter-preference-modal.filter-preference-name.unique-validator'
                              ),
                          },
                      }
                    : null
            )
        );

    public createFilterPreference() {
        if (
            !this.newFilterPreferenceForm ||
            this.newFilterPreferenceForm.invalid
        ) {
            return;
        }
        const name = this.newFilterPreferenceForm.controls[0].value!;
        this.newFilterPreference$.next({
            name,
            filter: this.filter,
        });
        this.bsModalRef.hide();
    }
}
