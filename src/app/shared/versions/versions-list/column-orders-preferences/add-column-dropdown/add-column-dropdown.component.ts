import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';

@Component({
    selector: 'app-add-column-dropdown',
    templateUrl: './add-column-dropdown.component.html',
    styleUrls: ['./add-column-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddColumnDropdownComponent {
    @Input() attributeCols!: (MetaAttribute | UUID)[];
    @Input() inline!: boolean;
    @Input() attributes!: ReadonlyArray<Attribute>;
    @Output() readonly addAttributeCol = new EventEmitter<
        MetaAttribute | UUID
    >();
}
