import type { Attribute } from '@cache-server/api/tables/attribute';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import type {
    Validator,
    Validators,
} from '@shared/utility/classes/state/validator-state';

export function generateAttributeValidators(
    attr: Attribute,
    mode: 'create' | 'edit' | 'search'
): Validators<any> {
    const required =
        attr.required &&
        // in search the required is not necessary
        mode !== 'search';
    switch (attr.kind) {
        case 'string':
            return createValidators<string | null>({
                minimumLength: attr.kindOptions.minimumLength,
                maximumLength: attr.kindOptions.maximumLength,
                pattern: attr.kindOptions.pattern,
                required:
                    required && // Overwrite required (disabled if it will be created automatically by the backend)
                    (typeof attr.kindOptions.defaultIncrementPrefix !==
                        'string' ||
                        mode === 'edit'),
            });
        case 'date-time':
        case 'date':
            return createValidators<string | null>({
                required,
                // minimum and maximum are directly specified in the input
            });
        case 'time':
            return createValidators<string | null>({
                timeMin: attr.kindOptions.minimum,
                timeMax: attr.kindOptions.maximum,
                required,
            });
        case 'email':
        case 'url':
            return createValidators<string | null>({
                minimumLength: attr.kindOptions.minimumLength,
                maximumLength: attr.kindOptions.maximumLength,
                pattern: attr.kindOptions.pattern,
                required,
            });
        case 'number':
            // multipleOf is directly specified in the input
            return createValidators<number | null>({
                minimum: attr.kindOptions.minimum,
                maximum: attr.kindOptions.maximum,
                required:
                    required && // Overwrite required (disabled if it will be created automatically by the backend)
                    (!attr.kindOptions.defaultIncrement || mode === 'edit'),
            });
        case 'boolean':
        case 'foreign':
        case 'files':
            return createValidators({
                required,
            });
        default:
            errors.error({
                message: `Unknown attribut.kind: ${(attr as Attribute).kind}`,
            });
            return [];
    }
}

/**
 * Creates validators that will not be created in the default
 * @param options which validators should be created
 * @returns the validators
 */
function createValidators<T>(options: ValidatorOptions): Validators<T> {
    const validators: Validator<any>[] = [];
    if (options.minimum !== null && options.minimum !== undefined) {
        validators.push(CustomValidators.min(options.minimum));
    }
    if (options.required) {
        validators.push(CustomValidators.required());
    }
    if (options.pattern !== null && options.pattern !== undefined) {
        validators.push(CustomValidators.pattern(options.pattern));
    }
    if (options.maximumLength !== null && options.maximumLength !== undefined) {
        validators.push(CustomValidators.maxLength(options.maximumLength));
    }
    if (options.minimumLength !== null && options.minimumLength !== undefined) {
        validators.push(CustomValidators.minLength(options.minimumLength));
    }
    if (options.maximum !== null && options.maximum !== undefined) {
        validators.push(CustomValidators.max(options.maximum));
    }
    if (options.timeMin !== null && options.timeMin !== undefined) {
        validators.push(CustomValidators.timeMin(options.timeMin));
    }
    if (options.timeMax !== null && options.timeMax !== undefined) {
        validators.push(CustomValidators.timeMax(options.timeMax));
    }
    return validators;
}

interface ValidatorOptions {
    pattern?: RegExp | null;
    maximumLength?: number | null;
    minimumLength?: number | null;
    maximum?: number | null;
    minimum?: number | null;
    timeMin?: string | null;
    timeMax?: string | null;
    required?: boolean | null;
}
