import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-attribute-col-name',
    templateUrl: './attribute-col-name.component.html',
    styleUrls: ['./attribute-col-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeColNameComponent {
    @Input() attributeCol!: MetaAttribute | UUID;
    @Input() attributes!: ReadonlyArray<Attribute>;
    @Input() displayAttributeKind!: boolean;
}
