import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

export class TimeInput extends InputControl<string | null> {
    /**
     *  A date to translate time to a date to be able to use the js internal date functions
     */
    static readonly dummyDate = '1970-01-01T';
    public readonly type = 'time';
    public readonly multipleOf: number | null = 0.001;
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
                    (value: string | null) =>
                        !value || timeRegex.test(value)
                            ? null
                            : {
                                  time: {
                                      value,
                                      translationKey: _(
                                          'validators.error.time'
                                      ),
                                  },
                              },
                    (value: string | null) =>
                        !value ||
                        (new Date(TimeInput.dummyDate + value).getTime() %
                            (settings.multipleOf || 1)) /
                            1000 ===
                            0
                            ? null
                            : {
                                  timeMultipleOf: {
                                      multipleOf: settings.multipleOf,
                                      value,
                                      translationKey: _(
                                          'validators.error.timeMultipleOf'
                                      ),
                                  },
                              },
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
                return (
                    Date.parse(TimeInput.dummyDate + value1) ===
                    Date.parse(TimeInput.dummyDate + value2)
                );
            }
        );
        this.setDisabled(settings.disabled ?? this.disabled);
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.description = settings.description ?? this.description;
        this.multipleOf = settings.multipleOf ?? this.multipleOf;
    }
}

const timeRegex =
    /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d|60)(\.\d+)?(([Zz])|([+|-]([01]\d|2[0-3]):[0-5]\d))$/u;
