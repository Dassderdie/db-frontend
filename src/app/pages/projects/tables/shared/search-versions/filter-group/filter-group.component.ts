import type { OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
} from '@angular/core';
import { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { metaAttributes } from '@cache-server/api/versions/version';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { fade } from '@shared/animations/fade';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import {
    EditableFilterGroup,
    generateEmptyEditableFilterGroup,
} from '../filter-utility/editable-filter-group';

@Component({
    selector: 'app-filter-group',
    templateUrl: './filter-group.component.html',
    styleUrls: ['./filter-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fade()],
})
export class FilterGroupComponent
    extends Destroyed
    implements OnInit, OnDestroy
{
    @Input() firstGroup = false;
    @Input() filterGroup!: EditableFilterGroup;
    @Input() table!: Table;
    /**
     * Whether to show the formGroup on initialisation
     */
    @Input() initialShowGroup = !(
        this.firstGroup && this.filterGroup.expressions.length === 0
    );
    /**
     * wether advanced options should be shown
     */
    @Input() advancedMode!: boolean;
    /**
     * Has the following Arguments:
     * `formGroupIsShown: boolean` - wether the FormGroup is shown
     */
    @Input() leftHeader?: TemplateRef<any>;
    /**
     * Has the following Arguments:
     * `formGroupIsShown: boolean` - wether the FormGroup is shown
     */
    @Input() rightHeader?: TemplateRef<any>;
    @Output() readonly filterGroupChanges = new EventEmitter<
        DeepWritable<EditableFilterGroup> | undefined
    >();

    // To use it in template
    public readonly breakpoints = Breakpoints;
    // To use it in the template
    public readonly metaAttributes = metaAttributes;
    public showGroup = true;

    ngOnInit() {
        this.showGroup = this.initialShowGroup;
    }

    public toggleNegated() {
        this.filterGroupChanges.emit({
            ...cloneDeepWritable(this.filterGroup),
            negated: !this.filterGroup.negated,
        });
    }

    public toggleConjunction() {
        this.filterGroupChanges.emit({
            ...cloneDeepWritable(this.filterGroup),
            conjunction: this.filterGroup.conjunction === 'and' ? 'or' : 'and',
        });
    }

    public toggleShowGroup() {
        this.showGroup = !this.showGroup;
    }

    /**
     * updates the expression at index to value
     * @param index
     * @param value
     */
    public updateExpression(
        index: number,
        value: DeepWritable<EditableFilterGroup['expressions'][0]> | undefined
    ) {
        const newFilterGroup = cloneDeepWritable(this.filterGroup);
        if (value) {
            newFilterGroup.expressions[index] = value;
        } else {
            newFilterGroup.expressions.splice(index, 1);
        }
        this.filterGroupChanges.emit(newFilterGroup);
    }

    public remove() {
        this.filterGroupChanges.emit(undefined);
    }

    public addGroup() {
        const newFilterGroup = cloneDeepWritable(this.filterGroup);
        newFilterGroup.expressions.push(generateEmptyEditableFilterGroup());
        this.filterGroupChanges.emit(newFilterGroup);
    }

    public addExpression(id: UUID | string) {
        const newFilterGroup = cloneDeepWritable(this.filterGroup);
        newFilterGroup.expressions.push({
            invalid: false,
            type: 'equal',
            value: null,
            key: id,
        });
        this.filterGroupChanges.emit(newFilterGroup);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
