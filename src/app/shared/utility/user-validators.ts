import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Validator } from './classes/state/validator-state';

export const userValidators = {
    username: [
        CustomValidators.required(),
        CustomValidators.minLength(4),
        CustomValidators.maxLength(32),
        CustomValidators.pattern(
            /(^[^\s\u200B-\u200D]$)|(^[^\s\u200B-\u200D][^\t\n\v]*[^\s\u200B-\u200D])$/u
        ),
    ] as Validator<string | null>[],
    password: [
        CustomValidators.required(),
        CustomValidators.minLength(6),
        CustomValidators.maxLength(255),
        (value: string | null) => {
            const containsNumber = value && /\d/u.test(value);
            return containsNumber
                ? null
                : {
                      containsNumber: {
                          value,
                          translationKey: _('validators.error.containsNumber'),
                      },
                  };
        },
        (value: string | null) => {
            const containsLetter = value && /[A-Za-z]/u.test(value);
            return containsLetter
                ? null
                : {
                      containsLetter: {
                          value,
                          translationKey: _('validators.error.containsLetter'),
                      },
                  };
        },
    ] as Validator<string | null>[],
    confirmPassword: (passwordGetter: () => string | null) =>
        ((value: string | null) => {
            const password = passwordGetter();
            return password === value
                ? null
                : {
                      matchesPassword: {
                          value,
                          translationKey: _('validators.error.matchesPassword'),
                      },
                  };
        }) as Validator<string | null>,
    email: [
        CustomValidators.required(),
        CustomValidators.minLength(4),
        CustomValidators.maxLength(255),
    ] as Validator<string | null>[],
};
