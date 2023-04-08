import type { Attribute } from '@cache-server/api/tables/attribute';
import type { InputType } from '@shared/inputs/input-type';
import type { CustomInput } from '@shared/inputs/input/input';
import type { Paths } from '@shared/utility/types/paths';

export interface AttributeOption {
    control: CustomInput & InputType;
    // Maximum Depth is 3, because of intermediate Attributes
    keys: Readonly<Paths<Attribute, 3>>;
}
