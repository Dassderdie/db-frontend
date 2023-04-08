import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';

@Component({
    selector: 'app-attribute-name',
    templateUrl: './attribute-name.component.html',
    styleUrls: ['./attribute-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays the (translated and appropriated styled) name of the given attribute
 */
export class AttributeNameComponent {
    @Input() attribute!: Attribute | DeepReadonly<EditableAttribute>;
    /**
     * Wether an icon indicating the kind of the attribute should been shown
     */
    @Input() displayKind!: boolean;
    /**
     * Wether the plural form of the attribute name should be shown if specified
     */
    @Input() plural = false;
}
