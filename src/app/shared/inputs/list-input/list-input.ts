import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { cloneDeep, isEqual } from 'lodash-es';
import { InputControl } from '../input-control';
import { CustomValidators } from '../shared/validation/custom-validators';

export class ListInput extends InputControl<string[] | null> {
    public readonly type = 'list';
    public readonly emptyMessage: string = _('custom-forms.empty-list');
    public readonly minItems: number | null = null;
    public readonly maxItems: number | null = null;
    public readonly required: boolean = false;
    public readonly placeholder: string = _('custom-forms.default-placeholder');
    public readonly addItemValidators: Validators<string | null>;
    public readonly addItemAsyncValidators?: AsyncValidators<string | null>;
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: string[] | null,
        public displayName: string,
        settings: {
            emptyMessage?: string;
            validators?: Validators<string[] | null>;
            asyncValidators?: AsyncValidators<string[] | null>;
            warningValidators?: Validators<string[] | null>;
            warningAsyncValidators?: AsyncValidators<string[] | null>;
            minItems?: number | null;
            maxItems?: number | null;
            required?: boolean;
            firstCurrentValue?: string[] | null;
            disabled?: boolean;
            placeholder?: string;
            addItemValidators?: Validators<string | null>;
            addItemAsyncValidators?: AsyncValidators<string | null>;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                persistent: [
                    (value: string[] | null) =>
                        value &&
                        settings.minItems &&
                        value.length < settings.minItems
                            ? {
                                  minItems: {
                                      value,
                                      minItems: settings.minItems,
                                      itemsAmount: value.length,
                                      translationKey: _(
                                          'validators.error.minItems'
                                      ),
                                  },
                              }
                            : null,
                    (value: string[] | null) =>
                        value &&
                        settings.maxItems &&
                        value.length > settings.maxItems
                            ? {
                                  maxItems: {
                                      value,
                                      maxItems: settings.maxItems,
                                      itemsAmount: value.length,
                                      translationKey: _(
                                          'validators.error.maxItems'
                                      ),
                                  },
                              }
                            : null,
                    ...(settings.required ? [CustomValidators.required()] : []),
                ],
                adjustable: settings.validators,
                adjustableWarnings: settings.warningValidators,
            },
            {
                adjustable: settings.asyncValidators,
                adjustableWarnings: settings.warningAsyncValidators,
            },
            settings.firstCurrentValue !== undefined
                ? settings.firstCurrentValue
                : // Copy initialValue to not change initialValue and firstCurrentValue
                  cloneDeep(initialValue),
            (value1: string[] | null, value2: string[] | null) =>
                isEqual(value1, value2)
        );
        this.addItemValidators = [
            (value: string | null) =>
                value && this.value?.includes(value)
                    ? {
                          alreadyInList: {
                              value,
                              translationKey: _(
                                  'validators.error.alreadyInList'
                              ),
                          },
                      }
                    : null,
            ...(settings.addItemValidators ?? []),
        ];
        this.setDisabled(settings.disabled ?? this.disabled);
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.required = settings.required ?? this.required;
        this.description = settings.description ?? this.description;
        this.emptyMessage = settings.emptyMessage ?? this.emptyMessage;
        this.maxItems = settings.maxItems ?? this.maxItems;
        this.minItems = settings.minItems ?? this.minItems;
        this.addItemAsyncValidators =
            settings.addItemAsyncValidators ?? this.addItemAsyncValidators;
    }
}
