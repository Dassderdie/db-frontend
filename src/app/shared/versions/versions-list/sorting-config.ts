import type { UUID } from '@cache-server/api/uuid';
import type { MetaAttribute } from '@cache-server/api/versions/version';

export interface SortingConfig {
    sortingKey: MetaAttribute | UUID | null;
    sortingOrder: 'ascending' | 'descending' | null;
}
