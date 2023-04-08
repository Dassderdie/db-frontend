import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Version, MetaAttribute } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-meta-attribute-value',
    templateUrl: './meta-attribute-value.component.html',
    styleUrls: ['./meta-attribute-value.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaAttributeValueComponent {
    @Input() entry!: Version;
    @Input() key!: MetaAttribute;
}
