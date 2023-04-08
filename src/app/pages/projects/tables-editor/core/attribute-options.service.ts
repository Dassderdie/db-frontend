import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { CheckboxInput } from '@shared/inputs/checkbox-input/checkbox-input';
import { DateInput } from '@shared/inputs/date-input/date-input';
import { DateTimeInput } from '@shared/inputs/date-time-input/date-time-input';
import { makeCustom } from '@shared/inputs/input/input';
import { ListInput } from '@shared/inputs/list-input/list-input';
import { NumberInput } from '@shared/inputs/number-input/number-input';
import { RealStringInput } from '@shared/inputs/real-string-input/real-string-input';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { TimeInput } from '@shared/inputs/time-input/time-input';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { EditableAttribute } from '@tables-editor/shared/edit-attribute/editable-attribute';
import type { AttributeOption } from './attribute-option';

@Injectable({
    providedIn: 'root',
})
export class AttributeOptionsService {
    /**
     * returns an array of all attribute options
     * the initialValue and firstCurrentValue are already set
     * @returns the attribute options, validators come last
     */
    getOptions(
        initialAttribute: DeepReadonly<EditableAttribute>,
        currentAttribute: DeepReadonly<EditableAttribute>
    ): { options: AttributeOption[]; numberOfNonValidatorOptions: number } {
        /**
         * the number of non validator options
         */
        let numberOfNonValidatorOptions = 0;
        const id = initialAttribute.id;
        const attrKind = initialAttribute.kind;
        const options: AttributeOption[] = [];
        if (
            [
                'string',
                'number',
                'boolean',
                'date',
                'date-time',
                'email',
                'time',
                'url',
                'foreign',
                'files',
            ].includes(attrKind)
        ) {
            const keys = ['hidden'] as const;
            options.push({
                control: new CheckboxInput(
                    `hidden${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.hidden.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.hidden.description'),
                    }
                ),
                keys,
            });
        }
        if (
            [
                'string',
                'number',
                'boolean',
                'date',
                'date-time',
                'email',
                'time',
                'url',
                'foreign',
                'files',
            ].includes(attrKind)
        ) {
            const keys = ['indexed'] as const;
            options.push({
                control: new CheckboxInput(
                    `indexed${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.indexed.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.indexed.description'),
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        if (['string'].includes(attrKind)) {
            const keys = ['kindOptions', 'text'] as const;
            options.push({
                control: new CheckboxInput(
                    `text${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.text.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.text.description'),
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        if (['string'].includes(attrKind)) {
            const keys = ['kindOptions', 'markdown'] as const;
            options.push({
                control: new CheckboxInput(
                    `markdown${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.markdown.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.markdown.description'),
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        if (['number'].includes(attrKind)) {
            const keys = ['kindOptions', 'defaultIncrement'] as const;
            options.push({
                control: new CheckboxInput(
                    `defaultIncrement${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.default-increment.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _(
                            'kind-options.default-increment.description'
                        ),
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        if (['string'].includes(attrKind)) {
            const keys = ['kindOptions', 'defaultIncrementPrefix'] as const;
            options.push({
                control: makeCustom(
                    new RealStringInput(
                        `default-increment-prefix${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.default-increment-prefix.name'
                                ),
                                description: _(
                                    'kind-options.default-increment-prefix.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        if (['number'].includes(attrKind)) {
            const keys = ['kindOptions', 'unit'] as const;
            options.push({
                control: makeCustom(
                    new StringInput(
                        `unit${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            kind: 'string',
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _('kind-options.unit.name'),
                                description: _('kind-options.unit.description'),
                            },
                        ],
                    }
                ),
                keys,
            });
            numberOfNonValidatorOptions++;
        }
        // Validators start from here on
        if (
            [
                'string',
                'number',
                'boolean',
                'date',
                'date-time',
                'email',
                'time',
                'url',
                'foreign',
                'files',
            ].includes(attrKind)
        ) {
            const keys = ['required'] as const;
            options.push({
                control: new CheckboxInput(
                    `required${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.required.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.required.description'),
                    }
                ),
                keys,
            });
        }
        if (
            [
                'string',
                'number',
                'boolean',
                'date',
                'date-time',
                'email',
                'time',
                'url',
            ].includes(attrKind)
        ) {
            const keys = ['unique'] as const;
            options.push({
                control: new CheckboxInput(
                    `unique${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.unique.name'),
                    'translate',
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        description: _('kind-options.unique.description'),
                    }
                ),
                keys,
            });
        }
        if (['foreign'].includes(attrKind)) {
            const keys = ['kindOptions', 'relationshipMin'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `relationshipMin${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            multipleOf: 1,
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.relationshipMin.name'
                                ),
                                description: _(
                                    'kind-options.relationshipMin.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['foreign'].includes(attrKind)) {
            const keys = ['kindOptions', 'relationshipMax'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `relationshipMax${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            multipleOf: 1,
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.relationshipMax.name'
                                ),
                                description: _(
                                    'kind-options.relationshipMax.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['foreign'].includes(attrKind)) {
            const keys = ['kindOptions', 'foreign', 'relationshipMin'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `foreignRelationshipMin${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.foreignRelationshipMin.name'
                                ),
                                description: _(
                                    'kind-options.foreignRelationshipMin.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['foreign'].includes(attrKind)) {
            const keys = ['kindOptions', 'foreign', 'relationshipMax'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `foreignRelationshipMax${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            multipleOf: 1,
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.foreignRelationshipMax.name'
                                ),
                                description: _(
                                    'kind-options.foreignRelationshipMax.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['string', 'url', 'email'].includes(attrKind)) {
            const keys = ['kindOptions', 'pattern'] as const;
            options.push({
                control: makeCustom(
                    new StringInput(
                        `pattern${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.regExp()],
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _('kind-options.pattern.name'),
                                description: _(
                                    'kind-options.pattern.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['string', 'url', 'email'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimumLength'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `minimumLength${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            multipleOf: 1,
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.minimumLength.name'
                                ),
                                description: _(
                                    'kind-options.minimumLength.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['string', 'url', 'email'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximumLength'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `maximumLength${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            validators: [CustomValidators.min(0)],
                            multipleOf: 1,
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.maximumLength.name'
                                ),
                                description: _(
                                    'kind-options.maximumLength.description'
                                ),
                            },
                        ],
                    }
                ),
                keys: ['kindOptions', 'maximumLength'],
            });
        }
        if (['number'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimum'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `minimum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _('kind-options.minimum.name'),
                                description: _(
                                    'kind-options.minimum.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['number'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximum'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `maximum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _('kind-options.maximum.name'),
                                description: _(
                                    'kind-options.maximum.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['number'].includes(attrKind)) {
            const keys = ['kindOptions', 'multipleOf'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `multipleOf${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            validators: [CustomValidators.min(0)],
                            // TODO: allow also double values
                            multipleOf: 1,
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _('kind-options.multipleOf.name'),
                                description: _(
                                    'kind-options.multipleOf.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['time'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimum'] as const;
            options.push({
                control: makeCustom(
                    new TimeInput(
                        `minimum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.minimumTime.name'
                                ),
                                description: _(
                                    'kind-options.minimumTime.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['time'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximum'] as const;
            options.push({
                control: makeCustom(
                    new TimeInput(
                        `maximum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.maximumTime.name'
                                ),
                                description: _(
                                    'kind-options.maximumTime.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['date-time'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimum'] as const;
            options.push({
                control: makeCustom(
                    new DateTimeInput(
                        `minimum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.minimumDateTime.name'
                                ),
                                description: _(
                                    'kind-options.minimumDateTime.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['date-time'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximum'] as const;
            options.push({
                control: makeCustom(
                    new DateTimeInput(
                        `maximum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.maximumDateTime.name'
                                ),
                                description: _(
                                    'kind-options.maximumDateTime.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['date'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimum'] as const;
            options.push({
                control: makeCustom(
                    new DateInput(
                        `minimum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.minimumDate.name'
                                ),
                                description: _(
                                    'kind-options.minimumDate.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['date'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximum'] as const;
            options.push({
                control: makeCustom(
                    new DateInput(
                        `maximum${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.maximumDate.name'
                                ),
                                description: _(
                                    'kind-options.maximumDate.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['files'].includes(attrKind)) {
            const keys = ['kindOptions', 'minimumFileAmount'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `minimumFileAmount${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            validators: [
                                CustomValidators.min(0),
                                CustomValidators.max(100),
                            ],
                            multipleOf: 1,
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.minimumFileAmount.name'
                                ),
                                description: _(
                                    'kind-options.minimumFileAmount.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['files'].includes(attrKind)) {
            const keys = ['kindOptions', 'maximumFileAmount'] as const;
            options.push({
                control: makeCustom(
                    new NumberInput(
                        `maximumFileAmount${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            validators: [
                                CustomValidators.min(0),
                                CustomValidators.max(100),
                            ],
                            multipleOf: 1,
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.maximumFileAmount.name'
                                ),
                                description: _(
                                    'kind-options.maximumFileAmount.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['files'].includes(attrKind)) {
            const keys = ['kindOptions', 'fileNamePattern'] as const;
            options.push({
                control: makeCustom(
                    new StringInput(
                        `fileNamePattern${id}`,
                        this.getAttributeValue(initialAttribute, keys),
                        {
                            firstCurrentValue: this.getAttributeValue(
                                currentAttribute,
                                keys
                            ),
                            validators: [CustomValidators.regExp()],
                        }
                    ),
                    {
                        leftAddons: [
                            {
                                translateKey: _(
                                    'kind-options.fileNamePattern.name'
                                ),
                                description: _(
                                    'kind-options.fileNamePattern.description'
                                ),
                            },
                        ],
                    }
                ),
                keys,
            });
        }
        if (['files'].includes(attrKind)) {
            const keys = ['kindOptions', 'allowedFileExtensions'] as const;
            options.push({
                control: new ListInput(
                    `allowedFileExtensions${id}`,
                    this.getAttributeValue(initialAttribute, keys),
                    _('kind-options.allowedFileExtensions.name'),
                    {
                        firstCurrentValue: this.getAttributeValue(
                            currentAttribute,
                            keys
                        ),
                        maxItems: 100,
                        emptyMessage: _(
                            'kind-options.allowedFileExtensions.empty'
                        ),
                        addItemValidators: [
                            CustomValidators.pattern(
                                // quite restrictive for now https://regexr.com/57oq7
                                /^[\dA-Za-z]*$/u
                            ),
                        ],
                        description: _(
                            'kind-options.allowedFileExtensions.description'
                        ),
                    }
                ),
                keys,
            });
        }
        return { options, numberOfNonValidatorOptions };
    }

    /**
     * @param attribute the attribute object from which the value should be retrieved
     * @param keys an array of all keys leading to the property
     * @returns the current value of the property in the attribute
     */
    public getAttributeValue(
        attribute: DeepReadonly<EditableAttribute>,
        keys: AttributeOption['keys']
    ): any {
        let value: any = attribute;
        for (const key of keys) {
            value = value[key];
        }
        return value;
    }
}
