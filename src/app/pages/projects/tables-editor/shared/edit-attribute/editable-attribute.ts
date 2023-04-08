import type { DeepWritable } from '@shared/utility/types/writable';
import type { UUID } from '@cache-server/api/uuid';
import type {
    Attribute,
    BooleanAttribute,
    DateAttribute,
    DateTimeAttribute,
    EMailAttribute,
    FilesAttribute,
    ForeignAttributeTemplate,
    GeneralAttribute,
    NumberAttribute,
    StringAttribute,
    TimeAttribute,
    UrlAttribute,
} from '@cache-server/api/tables/attribute';
import { v4 as uuid } from 'uuid';
import {
    DefaultDisplayNames,
    DefaultDescriptions,
} from '@tables-editor/pages/editable-table';

export type EditableAttribute =
    | EditableBooleanAttribute
    | EditableDateAttribute
    | EditableDateTimeAttribute
    | EditableEMailAttribute
    | EditableFilesAttribute
    | EditableForeignAttribute
    | EditableNumberAttribute
    | EditableStringAttribute
    | EditableTimeAttribute
    | EditableUrlAttribute;

abstract class EditableGeneralAttribute
    implements
        DeepWritable<
            Omit<GeneralAttribute<UUID>, 'descriptions' | 'displayNames'>
        >
{
    public readonly editingType: 'edit' | 'new' = 'new';
    abstract readonly kind: string;
    public displayNames = new DefaultDisplayNames();
    public descriptions = new DefaultDescriptions();
    public required = false;
    public unique = false;
    public indexed = true;
    public hidden = false;
    public kindOptions: DeepWritable<Attribute['kindOptions']> = {};

    constructor(public readonly id = uuid()) {}
}

export class EditableStringAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<StringAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'string';
    public kindOptions: DeepWritable<StringAttribute['kindOptions']> = {
        text: false,
        markdown: false,
    };
}

export class EditableBooleanAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<BooleanAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'boolean';
    public kindOptions: DeepWritable<BooleanAttribute['kindOptions']> = {};
}

export class EditableDateAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<DateAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'date';
    public kindOptions: DeepWritable<DateAttribute['kindOptions']> = {};
}

export class EditableDateTimeAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<DateTimeAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'date-time';
    public kindOptions: DeepWritable<DateTimeAttribute['kindOptions']> = {};
}

export class EditableNumberAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<NumberAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'number';
    public kindOptions: DeepWritable<NumberAttribute['kindOptions']> = {
        multipleOf: 1,
    };
}

export class EditableEMailAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<EMailAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'email';
    public kindOptions: DeepWritable<EMailAttribute['kindOptions']> = {};
}

export class EditableTimeAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<TimeAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'time';
    public kindOptions: DeepWritable<TimeAttribute['kindOptions']> = {};
}

export class EditableUrlAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<UrlAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'url';
    public kindOptions: DeepWritable<UrlAttribute['kindOptions']> = {};
}

export class EditableFilesAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<Omit<FilesAttribute, 'descriptions' | 'displayNames'>>
{
    public readonly kind = 'files';
    public kindOptions: DeepWritable<FilesAttribute['kindOptions']> = {};
}

export class EditableForeignAttribute
    extends EditableGeneralAttribute
    implements
        DeepWritable<
            Omit<
                ForeignAttributeTemplate<UUID, UUID, EditableAttribute>,
                'descriptions' | 'displayNames'
            >
        >
{
    public readonly kind = 'foreign';

    public kindOptions: DeepWritable<
        ForeignAttributeTemplate<UUID, UUID, EditableAttribute>
    >['kindOptions'] = {
        intermediateAttributes: [],
        intermediateTableId: '',
        relationshipMax: null,
        relationshipMin: null,
        foreign: {
            tableId: '',
            attributeId: null,
        },
    };

    constructor(
        foreignTableId: UUID,
        isForeignSingleInput: boolean,
        public displayNames = new DefaultDisplayNames(),
        id?: UUID
    ) {
        super(id);
        this.kindOptions.foreign.tableId = foreignTableId;
        if (isForeignSingleInput) {
            this.kindOptions.relationshipMax = 1;
        }
    }
}
