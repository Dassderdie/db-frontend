import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type {
    Attribute,
    ForeignAttribute,
} from '@cache-server/api/tables/attribute';
import type { Version } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-attribute-simple-value',
    templateUrl: './attribute-simple-value.component.html',
    styleUrls: ['./attribute-simple-value.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays all 'simple' (no additional information besides the attribute and the value is needed
 * -> all except from foreign-relations) values
 */
export class AttributeSimpleValueComponent {
    /**
     * the attribute whose value should be displayed
     */
    @Input() attribute!: Exclude<Attribute, ForeignAttribute>;
    /**
     * the value of the attribute that should be displayed
     */
    @Input() value!: Version['values'][0];
    /**
     * Whether a shorter version should be displayed if possible
     */
    @Input() small!: boolean;
}
