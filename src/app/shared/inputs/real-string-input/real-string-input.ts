import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

/**
 * an input that allows the empty string in addition to null and non empty strings
 */
export class RealStringInput extends InputControl<string | null> {
    readonly type = 'real-string';
    public placeholder: string = _('custom-forms.default-placeholder');
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: string | null,
        settings: {
            validators?: Validators<string | null>;
            asyncValidators?: AsyncValidators<string | null>;
            warningValidators?: Validators<string | null>;
            warningAsyncValidators?: AsyncValidators<string | null>;
            firstCurrentValue?: string | null;
            disabled?: boolean;
            placeholder?: string;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                adjustable: settings.validators,
                adjustableWarnings: settings.warningValidators,
            },
            {
                adjustable: settings.asyncValidators,
                adjustableWarnings: settings.warningAsyncValidators,
            },
            settings.firstCurrentValue
        );
        this.setDisabled(settings.disabled ?? this.disabled);
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.description = settings.description ?? this.description;
    }

    // TODO: remove generic (currently workaround because generic polymorphism isn't working I guess)
    // Overwrites the cleanValue function in order to allow ''
    protected cleanValue<U>(value: U) {
        if (value === undefined) {
            return null as unknown as U;
        }
        return value;
    }
}
