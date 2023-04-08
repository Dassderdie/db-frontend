import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';

/**
 * foreignAttr1 in table1 is in relation with foreignAttr2 in table2
 * @param intermediateTable an IntermediateTable connecting foreignAttr1 with foreignAttr2
 * @param tableId the unique id of table1
 * @param attributeId the unique id of foreignAttr1
 * @returns {
 *  entryAttributeId: attributeId of the attribute of the intermediateTable which points to foreignAttr1,
 *  foreignEntryAttributeId: attributeId of the attribute of the intermediateTable which points to foreignAttr2
 * }
 */
export function getForeignEntryAttributeIds(
    intermediateTable: IntermediateTable,
    tableId: UUID,
    attributeId: UUID
): {
    entryAttributeId: UUID;
    foreignEntryAttributeId: UUID;
} {
    /**
     * the first/second properties of an intermediateTable belong to the nextToLast/last attribute
     * -> if true the last attribute should be returned else the nextToLast
     */
    let lastAttribute: boolean | undefined;
    const firstTable = intermediateTable.intermediateTableInformation.first;
    if (
        firstTable.tableId === tableId &&
        firstTable.attributeId === attributeId
    ) {
        lastAttribute = false;
    } else {
        const secondTable =
            intermediateTable.intermediateTableInformation.second;
        if (
            secondTable.tableId === tableId &&
            secondTable.attributeId === attributeId
        ) {
            lastAttribute = true;
        } else {
            lastAttribute = undefined;
            errors.error({
                message: 'The foreignAttribute and tables are corrupted',
                // eslint-disable-next-line prefer-rest-params
                logValues: { arguments },
            });
        }
    }
    return {
        entryAttributeId:
            intermediateTable.attributes[
                intermediateTable.attributes.length - (lastAttribute ? 1 : 2)
            ]!.id,
        foreignEntryAttributeId:
            intermediateTable.attributes[
                intermediateTable.attributes.length - (!lastAttribute ? 1 : 2)
            ]!.id,
    };
}
