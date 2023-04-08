import type { FilesValue, Version } from '@cache-server/api/versions/version';
import type { FilesInputValues } from '@tables/shared/attribute-inputs/files/files-input-values';
import type { ForeignInputValues } from '@tables/shared/attribute-inputs/foreign/foreign-input-value';
import { isEmpty } from 'lodash-es';

export interface InputsValues {
    [attributeId: string]:
        | Exclude<Version['values'][0], FilesValue>
        | FilesInputValues
        | ForeignInputValues;
}

export function foreignValuesAreEmpty(foreignValues: ForeignInputValues) {
    return (
        foreignValues.newRelations.length === 0 &&
        isEmpty(foreignValues.changedRelations)
    );
}
