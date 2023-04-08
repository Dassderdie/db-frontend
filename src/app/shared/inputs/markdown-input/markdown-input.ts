import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { MetaAttribute } from '@cache-server/api/versions/version';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

export class MarkdownInput extends InputControl<string | null> {
    public readonly type = 'markdown';
    /**
     * The default css-height in pixel
     */
    public readonly height: number = 150;
    /**
     * The number of pixel specifying how much one click on the larger/smaller-btn should change
     */
    public readonly heightStep: number = 150;
    /**
     * The maximum css-height
     */
    public readonly maxHeight: number = 600;
    public readonly required: boolean = false;
    public readonly placeholder: string = _('custom-forms.default-placeholder');
    /**
     * if typeof string: the translation-key else
     * displayDescriptions object
     */
    public readonly description?: Languages<string | null> | string;

    constructor(
        name: string,
        initialValue: string | null,
        public displayName:
            | {
                  translateKey: string;
                  attribute?: undefined;
                  metaAttribute?: undefined;
              }
            | {
                  translateKey?: undefined;
                  attribute: Attribute;
                  metaAttribute?: undefined;
              }
            | {
                  translateKey?: undefined;
                  attribute?: undefined;
                  metaAttribute: MetaAttribute;
              },
        settings: {
            validators?: Validators<string | null>;
            asyncValidators?: AsyncValidators<string | null>;
            warningValidators?: Validators<string | null>;
            warningAsyncValidators?: AsyncValidators<string | null>;
            height?: number;
            heightStep?: number;
            maxHeight?: number;
            required?: boolean;
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
        this.height = settings.height ?? this.height;
        this.heightStep = settings.heightStep ?? this.heightStep;
        this.maxHeight = settings.maxHeight ?? this.maxHeight;
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.required = settings.required ?? this.required;
        this.description =
            settings.description ??
            this.displayName.attribute?.descriptions ??
            this.description;
    }
}
