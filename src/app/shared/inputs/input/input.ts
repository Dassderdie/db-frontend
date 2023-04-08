import type { CheckboxInput } from '../checkbox-input/checkbox-input';
import type { DateInput } from '../date-input/date-input';
import type { DateTimeInput } from '../date-time-input/date-time-input';
import type { InputType } from '../input-type';
import type { ListInput } from '../list-input/list-input';
import type { MarkdownInput } from '../markdown-input/markdown-input';
import type { NumberInput } from '../number-input/number-input';
import type { RealStringInput } from '../real-string-input/real-string-input';
import type { SelectInput } from '../select-input/select-input';
import type { Addon } from '../shared/addon/addon';
import type { StringInput } from '../string-input/string-input';
import type { TimeInput } from '../time-input/time-input';

export type CustomInput =
    | CheckboxInput<any>
    | ListInput
    | MarkdownInput
    | (Custom & DateInput)
    | (Custom & DateTimeInput)
    | (Custom & NumberInput)
    | (Custom & RealStringInput)
    | (Custom & SelectInput<any>)
    | (Custom & StringInput)
    | (Custom & TimeInput);

export interface Custom {
    readonly leftAddons?: ReadonlyArray<Addon>;
    readonly rightAddons?: ReadonlyArray<Addon>;
}

export function makeCustom<T extends InputType>(
    control: T,
    options: {
        leftAddons?: ReadonlyArray<Addon>;
        rightAddons?: ReadonlyArray<Addon>;
    }
) {
    switch (control.type) {
        case 'checkbox':
        case 'markdown':
        case 'list':
            return control;
        case 'date':
        case 'date-time':
        case 'time':
        case 'number':
        case 'select':
        case 'string':
        case 'real-string':
            (control as any).leftAddons = options.leftAddons;
            (control as any).rightAddons = options.rightAddons;
            return control as Custom & T;
        default:
            errors.error({
                message: `Unknown controlType: ${(control as InputType).type}`,
            });
            return control as Custom & T;
    }
}
