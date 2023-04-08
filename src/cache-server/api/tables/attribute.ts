import type { UUID } from '@cache-server/api/uuid';
import type { Languages } from '@core/utility/i18n/languages';
import type { JsonObject } from '@shared/utility/types/json-object';
import type { DisplayName } from './display-name';

export type Attribute =
    | BooleanAttribute
    | DateAttribute
    | DateTimeAttribute
    | EMailAttribute
    | FilesAttribute
    | ForeignAttribute
    | NumberAttribute
    | StringAttribute
    | TimeAttribute
    | UrlAttribute;

export interface GeneralAttribute<Id> {
    readonly kind: string;
    readonly id: Id;
    readonly displayNames: DisplayName;
    readonly descriptions: Readonly<Languages<string>>;
    readonly required: boolean;
    readonly unique: boolean;
    readonly indexed: boolean;
    readonly hidden: boolean;
}

// TODO: most kindOptions are not nullable (currently to simplify typings for EditableTable)
export interface StringAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'string';
    readonly kindOptions: Readonly<{
        text: boolean | null;
        markdown: boolean | null;
        pattern?: RegExp | null;
        minimumLength?: number | null;
        maximumLength?: number | null;
        defaultIncrementPrefix?: string | null;
    }>;
}

export interface BooleanAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'boolean';
    readonly kindOptions: Readonly<JsonObject>;
}

export interface DateAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'date';
    readonly kindOptions: Readonly<{
        minimum?: string | null;
        maximum?: string | null;
    }>;
}

export interface DateTimeAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'date-time';
    readonly kindOptions: Readonly<{
        minimum?: string | null;
        maximum?: string | null;
    }>;
}

export interface NumberAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'number';
    readonly kindOptions: Readonly<{
        unit?: string | null;
        multipleOf?: number | null;
        minimum?: number | null;
        maximum?: number | null;
        defaultIncrement?: boolean | null;
    }>;
}

export interface EMailAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'email';
    readonly kindOptions: Readonly<{
        pattern?: RegExp | null;
        minimumLength?: number | null;
        maximumLength?: number | null;
    }>;
}

export interface TimeAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'time';
    readonly kindOptions: Readonly<{
        minimum?: string | null;
        maximum?: string | null;
    }>;
}

export interface UrlAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'url';
    readonly kindOptions: Readonly<{
        pattern?: RegExp | null;
        minimumLength?: number | null;
        maximumLength?: number | null;
    }>;
}

export type ForeignAttribute = ForeignAttributeTemplate<UUID, UUID, Attribute>;

export interface ForeignAttributeTemplate<
    AttributeId,
    IntermediateTableId,
    Attr
> extends GeneralAttribute<AttributeId> {
    readonly kind: 'foreign';
    readonly kindOptions: Readonly<{
        relationshipMax: number | null;
        relationshipMin: number | null;
        foreign: Readonly<{
            tableId: UUID;
            attributeId: AttributeId | null;
            relationshipMax?: number | null;
            relationshipMin?: number | null;
        }>;
        intermediateTableId: IntermediateTableId;
        intermediateAttributes: ReadonlyArray<Attr>;
    }>;
}

export interface FilesAttribute<Id = UUID> extends GeneralAttribute<Id> {
    readonly kind: 'files';
    readonly kindOptions: Readonly<{
        fileNamePattern?: string | null;
        minimumFileAmount?: number | null;
        maximumFileAmount?: number | null;
        allowedFileExtensions?: ReadonlyArray<string> | null;
    }>;
}

export type NewAttribute =
    | BooleanAttribute<undefined>
    | DateAttribute<undefined>
    | DateTimeAttribute<undefined>
    | EMailAttribute<undefined>
    | FilesAttribute<undefined>
    | ForeignAttributeTemplate<undefined, undefined, NewAttribute>
    | NumberAttribute<undefined>
    | StringAttribute<undefined>
    | TimeAttribute<undefined>
    | UrlAttribute<undefined>;

export type EditAttribute =
    | BooleanAttribute
    | DateAttribute
    | DateTimeAttribute
    | EMailAttribute
    | FilesAttribute
    | ForeignEditAttribute
    | NewAttribute
    | NumberAttribute
    | StringAttribute
    | TimeAttribute
    | UrlAttribute;

export type ForeignEditAttribute = ForeignAttributeTemplate<
    UUID,
    undefined,
    EditAttribute
>;
