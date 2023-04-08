import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    Output,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Attribute } from '@cache-server/api/tables/attribute';
import { CheckboxInput } from '@shared/inputs/checkbox-input/checkbox-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { takeUntil } from 'rxjs/operators';
import { hasHiddenAttribute } from './has-hidden-attribute';

@Component({
    selector: 'app-show-hidden-attributes-input',
    templateUrl: './show-hidden-attributes-input.component.html',
    styleUrls: ['./show-hidden-attributes-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowHiddenAttributesInputComponent
    extends Destroyed
    implements OnInit, OnChanges, OnDestroy
{
    @Input() attributes!: ReadonlyArray<Attribute>;
    @Output() readonly showHiddenChanges = new EventEmitter<boolean>();
    /**
     * Wether there is an attribute (or intermediateAttribute)
     */
    public hasHiddenAttribute?: boolean;
    public readonly showHiddenInput = new CheckboxInput(
        'showHidden',
        false,
        _('entries.show-hidden-input.name'),
        'translate',
        {
            description: _('entries.show-hidden-input.description'),
        }
    );

    ngOnInit() {
        this.showHiddenInput.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.showHiddenChanges);
    }

    ngOnChanges() {
        this.hasHiddenAttribute = hasHiddenAttribute(this.attributes);
    }

    ngOnDestroy() {
        this.showHiddenInput.destroy();
        this.destroyed.next(undefined);
    }
}
