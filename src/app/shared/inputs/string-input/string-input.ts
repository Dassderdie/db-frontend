import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Languages } from '@core/utility/i18n/languages';
import type {
    AsyncValidators,
    Validators,
} from '@shared/utility/classes/state/validator-state';
import { InputControl } from '../input-control';

export class StringInput extends InputControl<string | null> {
    readonly type = 'string';
    public readonly kind:
        | 'email'
        | 'email'
        | 'password'
        | 'string'
        | 'text'
        | 'url' = 'string';
    public readonly placeholder: string = _('custom-forms.default-placeholder');
    public readonly autocomplete: Autocomplete = 'off';
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
            kind?: 'email' | 'email' | 'password' | 'string' | 'text' | 'url';
            disabled?: boolean;
            placeholder?: string;
            // See https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill for more information
            autocomplete?: Autocomplete;
            description?: Languages<string | null> | string;
        } = {}
    ) {
        super(
            name,
            initialValue,
            {
                persistent: [
                    ...(settings.kind === 'url'
                        ? [
                              (value: string | null) =>
                                  value && !urlRegex.test(value)
                                      ? {
                                            url: {
                                                value,
                                                translationKey: _(
                                                    'validators.error.url'
                                                ),
                                            },
                                        }
                                      : null,
                          ]
                        : []),
                    ...(settings.kind === 'email'
                        ? [
                              (value: string | null) =>
                                  value && !emailRegex.test(value)
                                      ? {
                                            email: {
                                                value,
                                                translationKey: _(
                                                    'validators.error.email'
                                                ),
                                            },
                                        }
                                      : null,
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
        this.setDisabled(settings.disabled ?? this.disabled);
        this.placeholder = settings.placeholder ?? this.placeholder;
        this.description = settings.description ?? this.description;
        this.kind = settings.kind ?? this.kind;
        this.autocomplete = settings.autocomplete ?? this.autocomplete;
    }
}

const urlRegex =
    // eslint-disable-next-line require-unicode-regexp, no-control-regex
    /^(?:http[s\u017F]?|ftp):\/\/(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:(?:[\dKSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[\dKSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?:\.(?:(?:[\dKSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[\dKSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*\.(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})(?::\d{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/;
const emailRegex =
    // eslint-disable-next-line require-unicode-regexp
    /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/;
type Autocomplete =
    | 'current-password'
    | 'email'
    | 'name'
    | 'new-password'
    | 'off'
    | 'on'
    | 'username';
