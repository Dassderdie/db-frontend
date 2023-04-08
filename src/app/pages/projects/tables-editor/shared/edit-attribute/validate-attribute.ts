import type { Validator } from '@shared/utility/classes/state/validator-state';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { isEmpty } from 'lodash-es';
import type { EditableAttribute } from './editable-attribute';

export function validateAttribute(attribute: EditableAttribute) {
    let errors: ReturnType<Validator<EditableAttribute>> = {};
    // maximum > minimum validators
    {
        let min: number | null | undefined;
        let max: number | null | undefined;
        let translationKey: string = _('validators.error.min-higher-max');
        let minName: string = _('kind-options.minimumLength.name');
        let maxName: string = _('kind-options.maximumLength.name');
        switch (attribute.kind) {
            case 'string':
            case 'email':
            case 'url':
                min = attribute.kindOptions.minimumLength;
                max = attribute.kindOptions.maximumLength;
                minName = _('kind-options.minimumLength.name');
                maxName = _('kind-options.maximumLength.name');
                break;
            case 'number':
                min = attribute.kindOptions.minimum;
                max = attribute.kindOptions.maximum;
                minName = _('kind-options.minimum.name');
                maxName = _('kind-options.maximum.name');
                break;
            case 'foreign':
                min = attribute.kindOptions.relationshipMin;
                max = attribute.kindOptions.relationshipMax;
                minName = _('kind-options.relationshipMin.name');
                maxName = _('kind-options.relationshipMax.name');
                break;
            case 'files':
                min = attribute.kindOptions.minimumFileAmount;
                max = attribute.kindOptions.maximumFileAmount;
                minName = _('kind-options.minimumFileAmount.name');
                maxName = _('kind-options.maximumFileAmount.name');
                break;
            case 'date':
            case 'date-time':
            case 'time':
                translationKey = _('validators.error.min-after-max');
                min =
                    typeof attribute.kindOptions.minimum === 'number'
                        ? new Date(attribute.kindOptions.minimum).getTime()
                        : null;
                max =
                    typeof attribute.kindOptions.maximum === 'number'
                        ? new Date(attribute.kindOptions.maximum).getTime()
                        : null;
                minName =
                    attribute.kind === 'date'
                        ? _('kind-options.minimumDate.name')
                        : attribute.kind === 'date-time'
                        ? _('kind-options.minimumDateTime.name')
                        : _('kind-options.minimumTime.name');
                maxName =
                    attribute.kind === 'date'
                        ? _('kind-options.maximumDate.name')
                        : attribute.kind === 'date-time'
                        ? _('kind-options.maximumDateTime.name')
                        : _('kind-options.maximumTime.name');
                break;
            case 'boolean':
        }
        errors = {
            ...validateMinSmallerMax(
                min,
                max,
                translationKey,
                minName,
                maxName
            ),
        };
    }
    // foreignRelationshipMin < foreignRelationshipMax
    if (attribute.kind === 'foreign') {
        const min = attribute.kindOptions.foreign.relationshipMin;
        const max = attribute.kindOptions.foreign.relationshipMax;
        if (typeof max === 'number' && typeof min === 'number' && min > max) {
            errors.minLengthHigherMaxLength2 = {
                translationKey: _('validators.error.min-higher-max'),
                translationKeyOptions: {
                    minName: _('kind-options.foreignRelationshipMin.name'),
                    maxName: _('kind-options.foreignRelationshipMax.name'),
                },
            };
        }
    }
    // defaultIncrement/defaultIncrementPrefix -> required
    {
        let hasDefaultIncrement = false;
        let defaultIncrementName: string = _('empty-translation');
        switch (attribute.kind) {
            case 'string':
                // can be '' too
                hasDefaultIncrement =
                    typeof attribute.kindOptions.defaultIncrementPrefix ===
                    'string';
                defaultIncrementName = _(
                    'kind-options.default-increment-prefix.name'
                );
                break;
            case 'number':
                hasDefaultIncrement = !!attribute.kindOptions.defaultIncrement;
                defaultIncrementName = _('kind-options.default-increment.name');
                break;
            case 'boolean':
            case 'date':
            case 'date-time':
            case 'email':
            case 'files':
            case 'foreign':
            case 'url':
            case 'time':
        }
        if (hasDefaultIncrement && !attribute.required) {
            errors.defaultIncrementRequired = {
                translationKey: _('validators.error.defaultIncrementRequired'),
                translationKeyOptions: {
                    incrementName: defaultIncrementName,
                },
            };
        }
    }
    // required && !defaultIncrement -> not hidden
    if (attribute.required && attribute.hidden) {
        let hasDefaultIncrement = false;
        switch (attribute.kind) {
            case 'string':
                // can be '' too
                hasDefaultIncrement =
                    typeof attribute.kindOptions.defaultIncrementPrefix ===
                    'string';
                break;
            case 'number':
                hasDefaultIncrement = !!attribute.kindOptions.defaultIncrement;
                break;
            case 'boolean':
            case 'date':
            case 'date-time':
            case 'email':
            case 'files':
            case 'foreign':
            case 'url':
            case 'time':
        }
        if (hasDefaultIncrement) {
            errors.hiddenNotRequired = {
                translationKey: _('validators.error.hiddenNotRequired'),
            };
        }
    }
    return isEmpty(errors) ? null : errors;
}

function validateMinSmallerMax(
    min: number | null | undefined,
    max: number | null | undefined,
    translationKey: string,
    minName: string,
    maxName: string
) {
    return typeof max === 'number' && typeof min === 'number' && min > max
        ? {
              minLengthHigherMaxLength: {
                  translationKey,
                  translationKeyOptions: {
                      minName,
                      maxName,
                  },
              },
          }
        : null;
}
