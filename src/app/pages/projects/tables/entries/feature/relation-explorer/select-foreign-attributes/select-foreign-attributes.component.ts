import type { OnChanges } from '@angular/core';
import {
    Component,
    Output,
    EventEmitter,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { Table } from '@cache-server/api/tables/table';
import { UUID } from '@cache-server/api/uuid';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { TableColorService } from '@tables/core/table-color.service';
import { isEqual } from 'lodash-es';
import type { ForeignAttributeIdSelection } from './foreign-attribute-id-selection';

@Component({
    selector: 'app-select-foreign-attributes',
    templateUrl: './select-foreign-attributes.component.html',
    styleUrls: ['./select-foreign-attributes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectForeignAttributesComponent implements OnChanges {
    @Input() tables!: ReadonlyArray<Table>;
    @Input() startTableId!: UUID;
    @Output() readonly selectedForeignAttributeIdsChange =
        new EventEmitter<ForeignAttributeIdSelection>();

    public attributeIdSelection: ForeignAttributeIdSelection = {};

    constructor(public readonly tableColorService: TableColorService) {}

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.tables) {
            this.tables
                .flatMap((table) => ({
                    table,
                    attributes: table.attributes.filter(
                        (attribute) => attribute.kind === 'foreign'
                    ),
                }))
                .forEach(({ table, attributes }) => {
                    // initialize/update selectedForeignAttributeIds
                    const newAttributeIdSelection: ForeignAttributeIdSelection[UUID] =
                        {};
                    for (const attribute of attributes) {
                        newAttributeIdSelection[attribute.id] =
                            this.attributeIdSelection[table.id]?.[
                                attribute.id
                            ] !== false;
                    }
                    this.attributeIdSelection = {
                        ...this.attributeIdSelection,
                        [table.id]: newAttributeIdSelection,
                    };
                });
            this.updateSelectedForeignAttributeIds();
        }
    }

    public toggleForeignAttribute(table: Table, attribute: ForeignAttribute) {
        this.attributeIdSelection = {
            ...this.attributeIdSelection,
            [table.id]: {
                ...this.attributeIdSelection[table.id],
                [attribute.id]:
                    !this.attributeIdSelection[table.id]![attribute.id],
            },
        };
        this.updateSelectedForeignAttributeIds();
    }

    private previousAttributeIdSelection?: ForeignAttributeIdSelection;
    private updateSelectedForeignAttributeIds() {
        if (
            isEqual(
                this.attributeIdSelection,
                this.previousAttributeIdSelection
            )
        ) {
            return;
        }
        this.previousAttributeIdSelection = this.attributeIdSelection;
        this.selectedForeignAttributeIdsChange.emit(this.attributeIdSelection);
    }
}
