import type { CheckboxInput } from './checkbox-input/checkbox-input';
import type { DateInput } from './date-input/date-input';
import type { DateTimeInput } from './date-time-input/date-time-input';
import type { ListInput } from './list-input/list-input';
import type { MarkdownInput } from './markdown-input/markdown-input';
import type { NumberInput } from './number-input/number-input';
import type { RealStringInput } from './real-string-input/real-string-input';
import type { SelectInput } from './select-input/select-input';
import type { StringInput } from './string-input/string-input';
import type { TimeInput } from './time-input/time-input';

export type InputType =
    | CheckboxInput<any>
    | DateInput
    | DateTimeInput
    | ListInput
    | MarkdownInput
    | NumberInput
    | RealStringInput
    | SelectInput<any>
    | StringInput
    | TimeInput;
