import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { DateInput } from '@shared/inputs/date-input/date-input';
import { DateTimeInput } from '@shared/inputs/date-time-input/date-time-input';
import type { InputType } from '@shared/inputs/input-type';
import type { CustomInput } from '@shared/inputs/input/input';
import { makeCustom } from '@shared/inputs/input/input';
import { MarkdownInput } from '@shared/inputs/markdown-input/markdown-input';
import { NumberInput } from '@shared/inputs/number-input/number-input';
import { Option } from '@shared/inputs/select-input/option';
import { SelectInput } from '@shared/inputs/select-input/select-input';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { TimeInput } from '@shared/inputs/time-input/time-input';
import { generateAttributeValidators } from '@shared/utility/functions/generate-attribute-validators';
import { uniqueEntryValidator } from './unique-validator';

@Injectable({
    providedIn: 'root',
})
export class AttributeInputsService {
    constructor(private readonly versionsService: VersionsService) {}

    // TODO: higher typesafety https://github.com/Microsoft/TypeScript/issues/14107
    // createInput(
    //     attr: StringAttribute,
    //     value: string | null
    // ): StringInput | TextInput | MarkdownInput;
    // createInput(
    //     attr: EMailAttribute | UrlAttribute,
    //     value: string | null
    // ): StringInput;
    // createInput(attr: BooleanAttribute, value: boolean | null): BooleanInput;
    // createInput(attr: DateAttribute, value: string | null): DateInput;
    // createInput(attr: TimeAttribute, value: string | null): TimeInput;
    // createInput(attr: DateTimeAttribute, value: string | null): DateTimeInput;
    // createInput(attr: NumberAttribute, value: number | null): NumberInput;
    /**
     *
     * @param projectId
     * @param tableId
     * @param attr
     * @param initialValue
     * @param edit wether the inputs are for the editing of an already existing entry or the creation of a new one
     * @param entryId
     * @param firstCurrentValue
     */
    public createInput<T extends InputType['value']>(
        projectId: UUID,
        tableId: UUID,
        attr: Attribute,
        initialValue: T,
        edit: boolean,
        entryId?: UUID,
        firstCurrentValue?: T | undefined
    ): CustomInput | undefined {
        const generalOptions = {
            // has to come
            validators: generateAttributeValidators(
                attr,
                edit ? 'edit' : 'create'
            ),
            asyncValidators: attr.unique
                ? [
                      uniqueEntryValidator<any>(
                          this.versionsService,
                          projectId,
                          tableId,
                          attr.id,
                          entryId
                      ),
                  ]
                : undefined,
            firstCurrentValue: firstCurrentValue as any,
        } as const;
        switch (attr.kind) {
            case 'string': {
                const placeholder =
                    typeof attr.kindOptions.defaultIncrementPrefix ===
                        'string' && !edit
                        ? _('custom-forms.default-increment')
                        : undefined;
                if (!attr.kindOptions.markdown) {
                    return makeCustom(
                        new StringInput(attr.id, initialValue as any, {
                            ...generalOptions,
                            placeholder,
                            kind: attr.kindOptions.text ? 'text' : 'string',
                        }),
                        {
                            leftAddons: [
                                {
                                    icon: attr.kindOptions.text
                                        ? 'text'
                                        : 'string',
                                },
                                { attribute: attr },
                            ],
                        }
                    );
                }
                return new MarkdownInput(
                    attr.id,
                    initialValue as any,
                    { attribute: attr },
                    {
                        height: attr.kindOptions.text ? 350 : 150,
                        ...generalOptions,
                    }
                );
            }
            case 'email':
            case 'url':
                return makeCustom(
                    new StringInput(attr.id, initialValue as any, {
                        ...generalOptions,
                        kind: attr.kind,
                    }),
                    {
                        leftAddons: [
                            {
                                icon: attr.kind,
                            },
                            { attribute: attr },
                        ],
                    }
                );
            case 'boolean':
                return makeCustom(
                    new SelectInput<boolean | null>(
                        attr.id,
                        initialValue as any,
                        [
                            new Option(
                                null,
                                {
                                    text: _('boolean.null'),
                                    kind: 'translate',
                                    icons: ['null'],
                                },
                                attr.required
                            ),
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
                            ...generalOptions,
                        }
                    ),
                    {
                        leftAddons: [{ icon: attr.kind }, { attribute: attr }],
                    }
                );
            case 'date':
                return makeCustom(
                    new DateInput(attr.id, initialValue as any, {
                        min: attr.kindOptions.minimum,
                        max: attr.kindOptions.maximum,
                        ...generalOptions,
                    }),
                    {
                        leftAddons: [{ icon: attr.kind }, { attribute: attr }],
                    }
                );
            case 'date-time':
                return makeCustom(
                    new DateTimeInput(attr.id, initialValue as any, {
                        min: attr.kindOptions.minimum,
                        max: attr.kindOptions.maximum,
                        ...generalOptions,
                    }),
                    {
                        leftAddons: [{ icon: attr.kind }, { attribute: attr }],
                    }
                );
            case 'time':
                return makeCustom(
                    new TimeInput(attr.id, initialValue as any, {
                        ...generalOptions,
                    }),
                    {
                        leftAddons: [{ icon: attr.kind }, { attribute: attr }],
                    }
                );
            case 'number':
                return makeCustom(
                    new NumberInput(attr.id, initialValue as any, {
                        ...generalOptions,
                        multipleOf: attr.kindOptions.multipleOf,
                        placeholder:
                            attr.kindOptions.defaultIncrement && !edit
                                ? _('custom-forms.default-increment')
                                : undefined,
                    }),
                    {
                        leftAddons: [{ icon: attr.kind }, { attribute: attr }],
                        rightAddons: attr.kindOptions.unit
                            ? [{ string: attr.kindOptions.unit }]
                            : undefined,
                    }
                );
            case 'foreign':
            case 'files':
                break;
            default:
                errors.error({
                    message: `Unknown attribut.kind: ${
                        (attr as Attribute).kind
                    }`,
                });
        }
        return undefined;
    }
}
