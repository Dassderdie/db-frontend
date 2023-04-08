import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    Output,
} from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import { UUID } from '@cache-server/api/uuid';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { DeepWritable } from '@shared/utility/types/writable';
import { isEqual } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { EditableAttributeFilter } from '../filter-utility/editable-filter-group';
import type { FilterInput } from './create-new-filter-input';
import { createNewFilterInput } from './create-new-filter-input';

@Component({
    selector: 'app-filter-input',
    templateUrl: './filter-input.component.html',
    styleUrls: ['./filter-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterInputComponent
    extends Destroyed
    implements OnChanges, OnDestroy
{
    /**
     * the AttributeFilter that should be edited in here
     */
    @Input() value!: EditableAttributeFilter;
    /**
     * the attribute which is associated with the AttributeFilter (attribute.id === value.key)
     * null for meta-attributes
     */
    @Input() attribute!: Attribute | null;
    @Input() projectId!: UUID;
    /**
     * emits the new Value always when it changes or
     * undefined to remove this inputFilter
     */
    @Output() readonly valueChange = new EventEmitter<
        DeepWritable<EditableAttributeFilter> | undefined
    >();

    public filterInput?: FilterInput;

    constructor(private readonly rolesService: RolesService) {
        super();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        errors.assert(
            !changes.attribute ||
                changes.attribute.isFirstChange() ||
                isEqual(
                    changes.attribute.currentValue,
                    changes.attribute.previousValue
                ),
            {
                status: 'logError',
                message:
                    'Attribute must not change! Create a new component instance instead',
            }
        );
        if (!this.filterInput) {
            this.filterInput = createNewFilterInput(
                this.attribute,
                this.value,
                this.rolesService.getRolesInProject(this.projectId).pipe(
                    map((roles) => roles.roles),
                    takeUntil(this.destroyed)
                ),
                this.projectId
            );
            if (!this.filterInput) {
                // errors have already been posted
                this.remove();
                return;
            }
            // See https://github.com/ReactiveX/rxjs/issues/3388
            combineLatest([
                this.filterInput.control.value$ as Observable<
                    EditableAttributeFilter['value']
                >,
                this.filterInput.selectTypeControl.value$,
            ])
                // debounceTime as a small performance improvement
                ?.pipe(debounceTime(200), takeUntil(this.destroyed))
                .subscribe(([value, type]) => {
                    this.valueChange.emit({
                        ...this.value,
                        value,
                        type,
                    });
                });
        } else if (changes.value) {
            this.filterInput.control.setValue(this.value.value as never);
            this.filterInput.selectTypeControl.setValue(this.value.type);
        }
    }

    public remove() {
        this.valueChange.emit(undefined);
    }

    ngOnDestroy() {
        this.filterInput?.selectTypeControl.destroy();
        this.filterInput?.control.destroy();
        this.destroyed.next(undefined);
    }
}
