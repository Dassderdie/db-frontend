import type {
    Attribute,
    EditAttribute,
    NewAttribute,
} from '@cache-server/api/tables/attribute';
import type { DisplayName } from '@cache-server/api/tables/display-name';
import type { UUID } from '@cache-server/api/uuid';
import type { Languages } from '@core/utility/i18n/languages';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { JsonObject } from '@shared/utility/types/json-object';
import type { Overwrite } from '@shared/utility/types/overwrite';

export type Table = DefaultTable | FilesTable | IntermediateTable;

interface GeneralTable {
    readonly id: UUID;
    readonly projectId: UUID;
    readonly attributes: ReadonlyArray<Attribute>;
    readonly allowAnonymousVersionCreation: boolean | null;
    readonly coordinates: {
        readonly x: number | null;
        readonly y: number | null;
    };
}

export interface DefaultTable extends GeneralTable {
    readonly displayNames: DisplayName;
    readonly descriptions: Languages<string>;
    readonly intermediateTableInformation: null;
    readonly type: 'default';
}

export interface FilesTable extends GeneralTable {
    readonly displayNames: JsonObject;
    readonly descriptions: JsonObject;
    readonly type: 'files';
}

export interface IntermediateTable extends GeneralTable {
    readonly displayNames: JsonObject;
    readonly descriptions: JsonObject;
    readonly intermediateTableInformation: DeepReadonly<{
        first: {
            tableId: UUID;
            attributeId: UUID;
            relationshipMax?: number | null;
            relationshipMin?: number | null;
        };
        second: {
            tableId: UUID;
            attributeId: UUID;
            relationshipMax?: number | null;
            relationshipMin?: number | null;
        };
    }>;
    readonly type: 'intermediate';
}

export type NewTable = Overwrite<
    GeneralTable,
    {
        id?: undefined;
        coordinates?: GeneralTable['coordinates'];
        displayNames: DisplayName;
        attributes: NewAttribute[];
        descriptions: DefaultTable['descriptions'];
    }
>;

export type EditTable = Overwrite<
    GeneralTable,
    {
        id?: undefined;
        tableId: UUID;
        type?: undefined;
        intermediateTableInformation?: undefined;
        displayNames: DisplayName;
        attributes: ReadonlyArray<EditAttribute>;
        descriptions: DefaultTable['descriptions'];
    }
>;
