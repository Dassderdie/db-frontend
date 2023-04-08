import type {
    Attribute,
    EditAttribute,
    NewAttribute,
} from '@cache-server/api/tables/attribute';
import type {
    DisplayName,
    DisplayNameItem,
    PessimisticDisplayNames,
} from '@cache-server/api/tables/display-name';
import type {
    DefaultTable,
    EditTable,
    NewTable,
} from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Languages } from '@core/utility/i18n/languages';
import type { Overwrite } from '@shared/utility/types/overwrite';
import type { DeepWritable } from '@shared/utility/types/writable';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';
import { cloneDeep, isEmpty, merge } from 'lodash-es';
import { v4 as uuid } from 'uuid';

export type EditableTable = EditableDefaultTable | EditableNewTable;

type EditableDefaultTable = Overwrite<
    DefaultTable,
    {
        attributes: ReadonlyArray<EditableAttribute>;
        displayNames: DefaultDisplayNames;
        descriptions: DefaultDescriptions;
    }
> & {
    editingType: 'edit';
};

export class EditableNewTable
    implements
        Omit<NewTable, 'attributes' | 'descriptions' | 'displayNames' | 'id'>
{
    public readonly id = uuid();
    public readonly editingType = 'new';
    public displayNames = new DefaultDisplayNames();
    public attributes: ReadonlyArray<EditableAttribute> = [];
    public descriptions = new DefaultDescriptions();
    public allowAnonymousVersionCreation: boolean | null = null;

    constructor(public projectId: UUID) {}
}

export class DefaultDisplayNames
    implements Languages<DisplayNameItem<string | null>>
{
    readonly eng = {
        singular: null as string | null,
        plural: null as string | null,
    };
    readonly ger = {
        singular: null as string | null,
        plural: null as string | null,
    };
}

export class DefaultDescriptions implements Languages<string | null> {
    readonly eng = null as string | null;
    readonly ger = null as string | null;
}

export function convertToEditableDefaultTable(
    table: DeepWritable<DefaultTable>
): EditableDefaultTable {
    const editableTable: EditableDefaultTable = {
        editingType: 'edit',
        ...table,
        displayNames: merge(
            cloneDeep(new DefaultDisplayNames()),
            table.displayNames
        ),
        descriptions: merge(
            cloneDeep(new DefaultDescriptions()),
            table.descriptions
        ),
        attributes: table.attributes.map((attribute) =>
            convertToEditableAttribute(attribute)
        ),
    };
    return editableTable;
}

function convertToEditableAttribute(
    attribute: DeepWritable<Attribute>
): EditableAttribute {
    const editableAttribute = {
        editingType: 'edit',
        ...attribute,
        displayNames: merge(
            cloneDeep(new DefaultDisplayNames()),
            attribute.displayNames
        ),
        descriptions: merge(
            cloneDeep(new DefaultDescriptions()),
            attribute.descriptions
        ),
    } as const;
    if (editableAttribute.kind === 'foreign') {
        return {
            ...editableAttribute,
            kindOptions: {
                // TODO: remove actions: undefined, workaround for https://gitlab.koppadb.com/koppadb/db-backend/-/issues/228
                ...{ ...editableAttribute.kindOptions, actions: undefined },
                intermediateAttributes:
                    editableAttribute.kindOptions.intermediateAttributes.map(
                        (attr) => convertToEditableAttribute(attr)
                    ),
            },
        };
    }
    return editableAttribute;
}

export function convertEditableTableToEditTable(
    table: EditableDefaultTable
): EditTable {
    const displayNames = cleanDisplayNames(table.displayNames);
    const descriptions = cleanDescriptions(table.descriptions);
    const attributes = table.attributes.map((attribute) =>
        cleanEditableAttribute(attribute)
    );
    return {
        tableId: table.id,
        projectId: table.projectId,
        displayNames,
        descriptions,
        attributes,
        coordinates: table.coordinates,
        allowAnonymousVersionCreation: table.allowAnonymousVersionCreation,
    };
}

export function convertTableToEditTable(table: DefaultTable): EditTable {
    const attributes = table.attributes.map((attribute) =>
        attributeToEditAttribute(attribute)
    );
    return {
        ...table,
        tableId: table.id,
        id: undefined,
        type: undefined,
        intermediateTableInformation: undefined,
        attributes,
    };
}

export function convertEditableNewTableToTable(
    newTable: EditableNewTable
): NewTable {
    const displayNames = cleanDisplayNames(newTable.displayNames);
    const descriptions = cleanDescriptions(newTable.descriptions);
    const attributes = newTable.attributes.map(
        (attribute) => cleanEditableAttribute(attribute) as NewAttribute
    );
    return {
        projectId: newTable.projectId,
        displayNames,
        descriptions,
        attributes,
        allowAnonymousVersionCreation: newTable.allowAnonymousVersionCreation,
    };
}

function cleanDisplayNames(
    displayNames: DeepWritable<PessimisticDisplayNames>
): DisplayName {
    const cleanedDisplayNames: DeepWritable<DisplayName> = {};
    for (const key of Object.keys(
        displayNames
    ) as (keyof PessimisticDisplayNames)[]) {
        const displayNameItem = displayNames[key];
        if (displayNameItem?.singular) {
            cleanedDisplayNames[key] = {
                singular: displayNameItem.singular,
                plural: displayNameItem.plural ?? undefined,
            };
        }
    }
    return cleanedDisplayNames;
}

function cleanDescriptions(
    descriptions: Languages<string | null>
): Languages<string> {
    const cleanedDescriptions: DeepWritable<Languages<string>> = {};
    for (const key of Object.keys(descriptions) as (keyof Languages<
        string | null
    >)[]) {
        const description = descriptions[key];
        if (description) {
            cleanedDescriptions[key] = description;
        }
    }
    return cleanedDescriptions;
}

function cleanEditableAttribute(
    editableAttribute: EditableAttribute
): EditAttribute {
    const attribute = {
        ...editableAttribute,
        displayNames: cleanDisplayNames(editableAttribute.displayNames),
        descriptions: cleanDescriptions(editableAttribute.descriptions),
        editingType: undefined,
    } as const;
    if (editableAttribute.editingType === 'new') {
        if (attribute.kind === 'foreign') {
            return {
                ...attribute,
                id: undefined,
                kindOptions: {
                    ...attribute.kindOptions,
                    intermediateAttributes:
                        attribute.kindOptions.intermediateAttributes.map(
                            (attr) =>
                                cleanEditableAttribute(attr) as NewAttribute
                        ),
                    intermediateTableId: undefined,
                    foreign: {
                        ...attribute.kindOptions.foreign,
                        attributeId: undefined,
                    },
                },
            };
        }
        return { ...attribute, id: undefined };
    }
    if (attribute.kind === 'foreign') {
        return {
            ...attribute,
            kindOptions: {
                ...attribute.kindOptions,
                intermediateAttributes:
                    attribute.kindOptions.intermediateAttributes.map((attr) =>
                        cleanEditableAttribute(attr)
                    ),
                intermediateTableId: undefined,
            },
        };
    }
    return attribute;
}

export function attributeToEditAttribute(attribute: Attribute): EditAttribute {
    if (attribute.kind === 'foreign') {
        // TODO: this is only a temporary workaround for https://gitlab.koppadb.com/koppadb/db-backend/-/issues/197
        const displayNames: DisplayName = isEmpty(attribute.displayNames)
            ? { eng: { singular: '???' } }
            : attribute.displayNames;
        return {
            ...attribute,
            displayNames,
            kindOptions: {
                // TODO: remove actions: undefined, workaround for https://gitlab.koppadb.com/koppadb/db-backend/-/issues/228
                ...{ ...attribute.kindOptions, actions: undefined },
                intermediateAttributes:
                    attribute.kindOptions.intermediateAttributes.map((attr) =>
                        attributeToEditAttribute(attr)
                    ),
                intermediateTableId: undefined,
            },
        };
    }
    return attribute;
}
