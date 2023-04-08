import type { DisplayName } from '@cache-server/api/tables/display-name';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

export class CheckboxInput<
    T extends DisplayName | string = DisplayName | string
> extends InputControl<boolean> {
    public readonly type = 'checkbox';
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: boolean,
        public readonly text: T,
        public readonly kind: T extends string
            ? 'string' | 'translate'
            : 'displayName',
        settings: {
            validators?: Validators<boolean>;
            asyncValidators?: AsyncValidators<boolean>;
            warningValidators?: Validators<boolean>;
            warningAsyncValidators?: AsyncValidators<boolean>;
            firstCurrentValue?: boolean;
            disabled?: boolean;
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
        this.description = settings.description ?? this.description;
    }
}
