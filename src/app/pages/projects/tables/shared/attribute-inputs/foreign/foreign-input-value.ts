import type { UUID } from '@cache-server/api/uuid';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';

/**
 * a foreign relation that should be created
 */
export interface NewForeignEntry {
    intermediateTableId: UUID;
    /**
     * the id of the attribute of the intermediate table, that belongs to the foreignEntryId
     */
    foreignEntryAttributeId: UUID;
    /**
     * id of the entry that is connected to the other one
     */
    foreignEntryId: UUID;
    /**
     * the id of the attribute of the intermediate table, that belongs to the entryId
     */
    entryAttributeId: UUID;
    /**
     * the id of the table that is through this foreign attribute connected with the table the user is currently editing
     */
    foreignTableId: UUID;
    /**
     * the values of the connected entries (entryId & foreignEntryId) are not in the changedIntermediateValues yet
     */
    changedIntermediateValues?: InputsValues;
}

/**
 * a relation that should either be edited or removed/deleted
 */
export interface EditForeignEntry extends NewForeignEntry {
    /**
     * wether to delete this entry
     */
    delete: boolean;
    /**
     * the value of the entryAttributeId
     */
    entryId: UUID;
}

/**
 * This object should only be edited via ForeignInputValuesProcessor
 */
export class ForeignInputValues {
    public readonly type = 'foreign';
    public newRelations: NewForeignEntry[] = [];
    public changedRelations: {
        /**
         * the key is the id of the entry in the intermediateTable
         */
        [intermediateEntryId: string]: EditForeignEntry;
    } = {};
    public numberOfDeletedPresentRelations = 0;
}
