import { moveItemInArray } from '@angular/cdk/drag-drop';
import type {
    ColumnOrdersPreferences,
    ColumnOrderPreference,
    ColumnOrdersPreference,
} from '@cache-server/api/roles/role';
import type { UUID } from '@cache-server/api/uuid';
import type { TranslateService } from '@ngx-translate/core';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import type { DeepWritable } from '@shared/utility/types/writable';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Table } from '@cache-server/api/tables/table';
import type { MessageService } from '@core/utility/messages/message.service';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { metaAttributes } from '@cache-server/api/versions/version';

export class EditableColumnOrdersPreferences {
    static async addColumnOrderPreference(
        columnOrdersPreferences: ColumnOrdersPreferences,
        newColumnOrderPreference: DeepWritable<ColumnOrderPreference>,
        table: Table,
        translateService: TranslateService
    ): Promise<DeepWritable<ColumnOrdersPreferences>> {
        const newColumnOrdersPreferences = cloneDeepWritable(
            columnOrdersPreferences
        );
        if (newColumnOrdersPreferences[table.id]) {
            errors.assert(
                !newColumnOrdersPreferences[table.id]!.some(
                    (columnOrderPreference) =>
                        columnOrderPreference.name ===
                        newColumnOrderPreference.name
                )
            );
            newColumnOrdersPreferences[table.id]!.push(
                newColumnOrderPreference
            );
        } else {
            newColumnOrdersPreferences[table.id] = [
                {
                    name: await translateService
                        .get(
                            _(
                                'pages.entries.column-orders.default-all-attributes'
                            )
                        )
                        .toPromise(),
                    attributeOrder: table.attributes.map(
                        (attribute) => attribute.id
                    ),
                },
                newColumnOrderPreference,
            ];
        }
        return newColumnOrdersPreferences;
    }

    static removeColumnOrderPreference(
        columnOrdersPreferences: DeepWritable<ColumnOrdersPreferences>,
        tableId: UUID,
        name: string
    ): DeepWritable<ColumnOrdersPreferences> {
        const columnOrdersPreference = columnOrdersPreferences[tableId];
        errors.assert(!!columnOrdersPreference);
        const newColumnOrdersPreference = columnOrdersPreference.filter(
            (columnOrderPreference) => columnOrderPreference.name !== name
        );
        if (newColumnOrdersPreference.length > 0) {
            columnOrdersPreferences[tableId] = newColumnOrdersPreference;
        } else {
            delete columnOrdersPreferences[tableId];
        }
        return columnOrdersPreferences;
    }

    static moveColumnOrderPreference(
        columnOrdersPreferences: DeepWritable<ColumnOrdersPreferences>,
        tableId: UUID,
        previousIndex: number,
        currentIndex: number
    ) {
        moveItemInArray(
            columnOrdersPreferences[tableId]!,
            previousIndex,
            currentIndex
        );
        return columnOrdersPreferences;
    }

    static repairColumnOrdersPreference(
        columnOrdersPreference: DeepWritable<ColumnOrdersPreference>,
        table: Table,
        messageService: MessageService
    ) {
        let repairNecessary = false;
        const newColumnOrdersPreference = columnOrdersPreference.map(
            (columnOrderPreference) => ({
                ...columnOrderPreference,
                attributeOrder: columnOrderPreference.attributeOrder.filter(
                    (id) => {
                        if (
                            table.attributes.some(
                                (attribute) =>
                                    attribute.id === id ||
                                    metaAttributes.includes(id as MetaAttribute)
                            )
                        ) {
                            return true;
                        }
                        repairNecessary = true;
                        return false;
                    }
                ),
            })
        );
        if (repairNecessary) {
            messageService.postMessage({
                color: 'warning',
                title: _('pages.entries.column-orders.repair-warning.title'),
                body: _('pages.entries.column-orders.repair-warning.body'),
            });
        }
        return newColumnOrdersPreference;
    }
    // TODO: rename
}
