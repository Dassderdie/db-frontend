import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { cloneDeep } from 'lodash-es';
import { merge, ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { StringInput } from '../string-input/string-input';
import { ListInput } from './list-input';

@Component({
    selector: 'app-list-input',
    templateUrl: './list-input.component.html',
    styleUrls: ['./list-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInputComponent
    extends SpecialInputComponent
    implements Destroyed, OnInit, OnDestroy
{
    @Input() control!: ListInput;

    public addItemInput!: StringInput;
    readonly destroyed = new Subject();
    public readonly breakpoints = Breakpoints;
    /**
     * Wether the user should be able to add the item in the addInput
     */
    public canAddItem = false;
    /**
     * the items that are displayed
     */
    public readonly filteredItems$ = new ReplaySubject<
        | {
              /**
               * The value of the item
               */
              value: string;
              /**
               * Wether the item should be highlighted
               */
              highlight: boolean;
          }[]
        | null
    >(1);

    ngOnInit() {
        this.addItemInput = new StringInput('add-item', null, {
            validators: this.control.addItemValidators,
            asyncValidators: this.control.addItemAsyncValidators,
            placeholder: this.control.placeholder,
        });
        merge(this.addItemInput.value$, this.control.value$)
            .pipe(
                map(() => this.generateFilteredItems()),
                takeUntil(this.destroyed)
            )
            .subscribe(this.filteredItems$);
        // keep canAddItem up to date
        merge(
            this.control.value$,
            this.control.disabled$,
            this.addItemInput.value$,
            this.addItemInput.invalid$
        )
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this.canAddItem = !!(
                    !this.addItemInput.invalid &&
                    this.addItemInput.value &&
                    !this.control.disabled &&
                    (!this.control.maxItems ||
                        !this.control.value ||
                        this.control.maxItems > this.control.value.length)
                );
                this.changeDetectorRef.markForCheck();
            });
    }

    public addItem() {
        if (this.canAddItem) {
            let newValue: string[] | null = cloneDeep(this.control.value);
            if (!newValue) {
                newValue = [];
            }
            newValue.unshift(this.addItemInput.value!);
            this.control.setValue(newValue);
            this.addItemInput.setValue(null);
        }
    }

    public removeItem(index: number) {
        if (!this.control.value) {
            errors.error({
                message: `Cannot remove ${index}, because there are no items`,
            });
            return;
        }
        let newValue: string[] | null = cloneDeep(this.control.value);
        newValue.splice(index, 1);
        if (newValue.length === 0) {
            newValue = null;
        }
        this.control.setValue(newValue);
    }

    private generateFilteredItems() {
        if (!this.control.value) {
            return null;
        }
        const items = this.control.value.map((item) => ({
            value: item,
            highlight:
                !this.addItemInput?.value ||
                item.includes(this.addItemInput.value),
        }));
        // sort items (those with highlight first)
        items.sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0));
        return items;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
