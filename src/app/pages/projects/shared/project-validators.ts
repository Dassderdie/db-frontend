import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import type { Validator } from '@shared/utility/classes/state/validator-state';

export const projectValidators: {
    name: Validator<string | null>[];
    description: Validator<string | null>[];
} = {
    name: [
        CustomValidators.required(),
        CustomValidators.minLength(4),
        CustomValidators.maxLength(30),
    ],
    description: [CustomValidators.maxLength(10000)],
};
