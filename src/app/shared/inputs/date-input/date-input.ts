import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';
import { CustomValidators } from '../shared/validation/custom-validators';

export class DateInput extends InputControl<string | null> {
    public readonly type = 'date';
    public readonly min?: string | null;
    public readonly max?: string | null;
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: string | null,
        settings: {
            validators?: Validators<string | null>;
            asyncValidators?: AsyncValidators<string | null>;
            warningValidators?: Validators<string | null>;
            warningAsyncValidators?: AsyncValidators<string | null>;
            firstCurrentValue?: string | null;
            min?: string | null;
            max?: string | null;
            disabled?: boolean;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                persistent: [
                    (value) =>
                        !value ||
                        /^(\d+)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/u.test(
                            value
                        )
                            ? null
                            : {
                                  date: {
                                      value,
                                      translationKey: _(
                                          'validators.error.date'
                                      ),
                                  },
                              },
                    ...(settings.min
                        ? [CustomValidators.dateMin(settings.min)]
                        : []),
                    ...(settings.max
                        ? [CustomValidators.dateMax(settings.max)]
                        : []),
                ],
                adjustable: settings.validators,
                adjustableWarnings: settings.warningValidators,
            },
            {
                adjustable: settings.asyncValidators,
                adjustableWarnings: settings.warningAsyncValidators,
            },
            settings.firstCurrentValue,
            (value1, value2) => {
                if (!value1 || !value2) {
                    return value2 === value1;
                }
                return Date.parse(value1) === Date.parse(value2);
            }
        );
        this.min = settings.min;
        this.max = settings.max;
        this.setDisabled(settings.disabled ?? this.disabled);
        this.description = settings.description ?? this.description;
    }
}
