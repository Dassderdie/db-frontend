import type { Attribute } from '@cache-server/api/tables/attribute';

export interface ChangesRow {
    readonly attribute: Attribute;
    readonly status: RowStatus;
}

type RowStatus = 'changed' | 'deleted' | 'new' | 'unchanged';
