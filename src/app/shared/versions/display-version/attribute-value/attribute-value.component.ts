import type { OnChanges } from '@angular/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Attribute } from '@cache-server/api/tables/attribute';
import { Version } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-attribute-value',
    templateUrl: './attribute-value.component.html',
    styleUrls: ['./attribute-value.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays all values of an attribute (also foreign)
 */
export class AttributeValueComponent implements OnChanges {
    /**
     * The attribute whose value should be displayed
     */
    @Input() attribute!: Attribute;
    /**
     * The version from which the value should be displayed
     */
    @Input() version!: Version;
    /**
     * Whether there is not enough space to display e.g. all foreign-many relations
     */
    @Input() small = false;
    /**
     * Wether hidden attributes should be shown
     */
    @Input() showHidden = false;
    /**
     * If provided this element is used to determine wether the attribute is visible and should be displayed
     * null -> the root element is the viewport
     */
    @Input() root?: HTMLElement | null;

    /**
     * Wether the values should be loaded/displayed (to improve performance only when it was visible)
     */
    public loaded = false;

    ngOnChanges() {
        if (this.root === undefined) {
            this.loaded = true;
        }
    }
}
