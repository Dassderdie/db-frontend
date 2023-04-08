import type { OnDestroy, TemplateRef } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { Subject } from 'rxjs';
import { SpecialInputComponent } from '../shared/special-input-component';
import type { Option } from './option';
import { SelectInput } from './select-input';

@Component({
    selector: 'app-select-input, [app-select-input]',
    templateUrl: './select-input.component.html',
    styleUrls: ['./select-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectInputComponent<T>
    extends SpecialInputComponent
    implements Destroyed, OnDestroy
{
    @Input() prependTemplate: TemplateRef<any> | null = null;
    @Input() appendTemplate: TemplateRef<any> | null = null;
    @Input() control!: SelectInput<T>;
    /**
     *  Whether the input-group-wrapper should be rendered
     */
    @Input() inputGroup = true;
    @Input() lightButton = false;

    readonly destroyed = new Subject();

    public changeOption(option: Option<T>) {
        this.control.setValue(option.value);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
