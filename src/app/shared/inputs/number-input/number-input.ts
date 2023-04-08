import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

export class NumberInput extends InputControl<number | null> {
    readonly type = 'number';
    /**
     * the value has to be a multiple of multipleOf to be valid
     */
    public readonly multipleOf?: number | null;
    public readonly placeholder: string = _('custom-forms.default-placeholder');
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: number | null,
        settings: {
            validators?: Validators<number | null>;
            asyncValidators?: AsyncValidators<number | null>;
            warningValidators?: Validators<number | null>;
            warningAsyncValidators?: AsyncValidators<number | null>;
            firstCurrentValue?: number | null;
            multipleOf?: number | null;
            disabled?: boolean;
            placeholder?: string;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                persistent: [
                    (value: number | null) =>
                        value !== null && Number.isNaN(value)
                            ? {
                                  isNumber: {
                                      value,
                                      translationKey: _(
                                          'validators.error.isNumber'
                                      ),
                                  },
                              }
                            : null,
                    ...(settings.multipleOf
                        ? [
                              (value: number | null) => {
                                  if (value === null) {
                                      return null;
                                  }
                                  // Convert float to integer values by multiplying with "decimalFactor"
                                  const decimalFactor = 100000000;
                                  // Int values for exact calculation
                                  const intValue = Math.round(
                                      value * decimalFactor
                                  );
                                  const intMultipleOf = Math.round(
                                      settings.multipleOf! * decimalFactor
                                  );
                                  const next =
                                      (Math.ceil(intValue / intMultipleOf) *
                                          intMultipleOf) /
                                      decimalFactor;
                                  const previous =
                                      ((Math.ceil(intValue / intMultipleOf) -
                                          1) *
                                          intMultipleOf) /
                                      decimalFactor;
                                  return Math.ceil(intValue / intMultipleOf) *
                                      intMultipleOf ===
                                      intValue
                                      ? null
                                      : {
                                            isMultipleOf: {
                                                multipleOf: settings.multipleOf,
                                                next,
                                                previous,
                                                value,
                                                translationKey: _(
                                                    'validators.error.isMultipleOf'
                                                ),
                                            },
                                        };
                              },
                          ]
                        : []),
                ],
                adjustable: settings.validators,
                adjustableWarnings: settings.warningValidators,
            },
            {
                adjustable: settings.asyncValidators,
                adjustableWarnings: settings.warningAsyncValidators,
            },
            settings.firstCurrentValue
        );
        this.multipleOf = settings.multipleOf ?? this.multipleOf;
        this.setDisabled(settings.disabled ?? this.disabled);
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.description = settings.description ?? this.description;
    }
}
