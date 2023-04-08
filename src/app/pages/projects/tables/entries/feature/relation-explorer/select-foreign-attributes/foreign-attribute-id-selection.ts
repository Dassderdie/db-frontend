export interface ForeignAttributeIdSelection {
    [tableId: string]: {
        [attributeId: string]: boolean;
    };
}
