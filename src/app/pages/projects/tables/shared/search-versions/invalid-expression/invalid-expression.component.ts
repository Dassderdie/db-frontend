import {
    Component,
    ChangeDetectionStrategy,
    Output,
    EventEmitter,
    Input,
} from '@angular/core';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { EditableAttributeFilter } from '../filter-utility/editable-filter-group';

@Component({
    selector: 'app-invalid-expression',
    templateUrl: './invalid-expression.component.html',
    styleUrls: ['./invalid-expression.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvalidExpressionComponent {
    @Input() expression!: EditableAttributeFilter;
    @Output() readonly removeExpression = new EventEmitter<unknown>();

    // To use it in template
    public readonly breakpoints = Breakpoints;
}
