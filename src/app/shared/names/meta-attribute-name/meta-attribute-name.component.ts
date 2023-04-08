import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MetaAttribute } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-meta-attribute-name',
    templateUrl: './meta-attribute-name.component.html',
    styleUrls: ['./meta-attribute-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays the (translated and appropriated styled) name of the given metaAttribute (deleted, createdAt, ...)
 */
export class MetaAttributeNameComponent {
    @Input() metaAttribute!: MetaAttribute;
    /**
     * Wether an icon indicating the kind of the metaAttribute should been shown
     */
    @Input() displayKind!: boolean;
    // TODO: plural?
}
