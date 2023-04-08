import type { Attribute } from '@cache-server/api/tables/attribute';
import { anonymousUserId } from '@cache-server/api/users/anonymous-user-id';
import type { UUID } from '@cache-server/api/uuid';
import { DateInput } from '@shared/inputs/date-input/date-input';
import { DateTimeInput } from '@shared/inputs/date-time-input/date-time-input';
import { NumberInput } from '@shared/inputs/number-input/number-input';
import { SelectInput } from '@shared/inputs/select-input/select-input';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { TimeInput } from '@shared/inputs/time-input/time-input';
import { getMetaAttributeIcon } from '@shared/names/utility/get-meta-attribute-icon';
import { generateAttributeValidators } from '@shared/utility/functions/generate-attribute-validators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Option } from '@shared/inputs/select-input/option';
import type { Addon } from '@shared/inputs/shared/addon/addon';
import type { Observable } from 'rxjs';
import type { Role } from '@cache-server/api/roles/role';
import type { InputType } from '@shared/inputs/input-type';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import { map } from 'rxjs/operators';
import { v4 as uuid4 } from 'uuid';
import type { EditableAttributeFilter } from '../filter-utility/editable-filter-group';

export function createNewFilterInput(
    attribute: Attribute | null,
    initialValue: EditableAttributeFilter,
    roles$: Observable<ReadonlyArray<Role>>,
    projectId: UUID
): FilterInput | undefined {
    const createSelectTypeInput = (
        options: ReadonlyArray<Option<EditableAttributeFilter['type']>>
    ) =>
        new SelectInput<EditableAttributeFilter['type']>(
            `${uuid4()}selectType`,
            'equal',
            options,
            {
                firstCurrentValue: initialValue.type,
            }
        );
    // If an attribute is supplied this is a filter for an attribute
    if (attribute) {
        return createNewFilterInputFromAttribute(
            attribute,
            initialValue,
            createSelectTypeInput
        );
    }
    const metaAttribute = initialValue.key as MetaAttribute;
    const defaultRightAddons: ReadonlyArray<Addon> = [];
    const defaultLeftAddons: ReadonlyArray<Addon> = [
        { icon: getMetaAttributeIcon(initialValue.key as MetaAttribute) },
        { metaAttribute },
    ];

    // This is a meta-data-attribute
    switch (metaAttribute) {
        case 'deleted':
            return {
                control: new SelectInput(
                    `${uuid4()}control`,
                    false,
                    [
                        new Option(
                            true,
                            {
                                text: _('boolean.true'),
                                kind: 'translate',
                                icons: ['true'],
                            },
                            false
                        ),
                        new Option(
                            false,
                            {
                                text: _('boolean.false'),
                                kind: 'translate',
                                icons: ['false'],
                            },
                            false
                        ),
                    ],
                    { firstCurrentValue: initialValue.value ?? false }
                ),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    equalFilterTypeOptions
                ),
            };
        case 'entryCreatedAt':
        case 'createdAt':
        case 'invalidatedAt':
            return {
                control: new DateTimeInput(`${uuid4()}control`, null, {
                    firstCurrentValue: initialValue.value as string | null,
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    comparisonFilterTypeOptions
                ),
            };
        case 'creatorId':
        case 'invalidatorId':
            return {
                control: new SelectInput(
                    `${uuid4()}control`,
                    anonymousUserId,
                    roles$.pipe(
                        map((roles) => [
                            new Option(
                                anonymousUserId,
                                {
                                    text: _('roles.anonymousUser'),
                                    kind: 'translate',
                                    icons: ['anonymous'],
                                },
                                false
                            ),
                            ...roles.map(
                                (role) =>
                                    new Option(
                                        role.userId,
                                        { userId: role.userId, projectId },
                                        false
                                    )
                            ),
                        ])
                    ),
                    {
                        firstCurrentValue:
                            initialValue.value ?? anonymousUserId,
                    }
                ),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    equalFilterTypeOptions
                ),
            };
        default:
            errors.error({
                message: 'Unknown meta-Attribute-kind',
                logValues: { metaAttribute, attribute },
            });
            return undefined;
    }
}

function createNewFilterInputFromAttribute(
    attribute: Attribute,
    initialValue: EditableAttributeFilter,
    createSelectTypeInput: (
        options: ReadonlyArray<Option<EditableAttributeFilter['type']>>
    ) => SelectInput<EditableAttributeFilter['type']>
): FilterInput | undefined {
    const defaultRightAddons: ReadonlyArray<Addon> = [];
    const defaultLeftAddons: ReadonlyArray<Addon> = [
        { icon: attribute.kind },
        { attribute },
    ];
    switch (attribute.kind) {
        case 'number':
            return {
                control: new NumberInput(`${uuid4()}control`, null, {
                    firstCurrentValue: initialValue.value as number | null,
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: [
                    ...defaultRightAddons,
                    ...(attribute.kindOptions.unit
                        ? [{ string: attribute.kindOptions.unit }]
                        : []),
                ],
                selectTypeControl: createSelectTypeInput(
                    comparisonFilterTypeOptions
                ),
            };
        case 'email':
        case 'url':
        case 'string':
            return {
                control: new StringInput(`${uuid4()}control`, null, {
                    kind: attribute.kind,
                    firstCurrentValue: initialValue.value as string | null,
                    warningValidators: generateAttributeValidators(
                        attribute,
                        'search'
                    ),
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    equalFilterTypeOptions
                ),
            };
        case 'date':
            return {
                control: new DateInput(`${uuid4()}control`, null, {
                    firstCurrentValue: initialValue.value as string | null,
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    comparisonFilterTypeOptions
                ),
            };
        case 'time':
            return {
                control: new TimeInput(`${uuid4()}control`, null, {
                    firstCurrentValue: initialValue.value as string | null,
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    comparisonFilterTypeOptions
                ),
            };
        case 'date-time':
            return {
                control: new DateTimeInput(`${uuid4()}control`, null, {
                    firstCurrentValue: initialValue.value as string | null,
                }),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    comparisonFilterTypeOptions
                ),
            };
        case 'boolean':
            return {
                control: new SelectInput(
                    `${uuid4()}control`,
                    null,
                    [
                        new Option(null, {
                            text: _('boolean.null'),
                            kind: 'translate',
                            icons: ['null'],
                        }),
                        new Option(
                            true,
                            {
                                text: _('boolean.true'),
                                kind: 'translate',
                                icons: ['true'],
                            },
                            false
                        ),
                        new Option(
                            false,
                            {
                                text: _('boolean.false'),
                                kind: 'translate',
                                icons: ['false'],
                            },
                            false
                        ),
                    ],
                    {
                        firstCurrentValue: initialValue.value as boolean | null,
                    }
                ),
                leftAddons: defaultLeftAddons,
                rightAddons: defaultRightAddons,
                selectTypeControl: createSelectTypeInput(
                    equalFilterTypeOptions
                ),
            };
        case 'foreign':
        case 'files':
        default:
            errors.error({
                logValues: { attribute },
            });
            return undefined;
    }
}

const equalFilterTypeOptions: ReadonlyArray<
    Option<EditableAttributeFilter['type']>
> = [
    new Option('equal', { text: '=', kind: 'string' }),
    new Option('notEqual', { text: '≠', kind: 'string' }),
];

const comparisonFilterTypeOptions: ReadonlyArray<
    Option<EditableAttributeFilter['type']>
> = [
    ...equalFilterTypeOptions,
    new Option('greater', {
        text: '>',
        kind: 'string',
    }),
    new Option('less', {
        text: '<',
        kind: 'string',
    }),
    new Option('greaterOrEqual', {
        text: '≥',
        kind: 'string',
    }),
    new Option('lessOrEqual', {
        text: '≤',
        kind: 'string',
    }),
];
export interface FilterInput {
    rightAddons: ReadonlyArray<Addon>;
    leftAddons: ReadonlyArray<Addon>;
    control: InputType;
    selectTypeControl: SelectInput<EditableAttributeFilter['type']>;
}
