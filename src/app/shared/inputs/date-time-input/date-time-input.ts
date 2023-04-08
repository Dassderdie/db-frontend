import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';
import { CustomValidators } from '../shared/validation/custom-validators';

export class DateTimeInput extends InputControl<string | null> {
    public readonly type = 'date-time';
    public readonly min?: string | null;
    public readonly max?: string | null;
    public readonly placeholder: string = _('custom-forms.default-placeholder');
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
            placeholder?: string;
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
                        /^(\d+)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])[Tt]([01]\d|2[0-3]):([0-5]\d):([0-5]\d|60)(\.\d+)?(([Zz])|([+|-]([01]\d|2[0-3]):[0-5]\d))$/u.test(
                            value
                        )
                            ? null
                            : {
                                  date: {
                                      value,
                                      translationKey: _(
                                          'validators.error.dateTime'
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
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.description = settings.description ?? this.description;
    }
}
