import type { UUID } from '@cache-server/api/uuid';
import type { FilesValue, Version } from '@cache-server/api/versions/version';

export interface AttributeFilter {
    readonly type:
        | 'equal'
        | 'greater'
        | 'greaterOrEqual'
        | 'less'
        | 'lessOrEqual'
        | 'notEqual';
    readonly key: UUID;
    readonly value: Exclude<Version['values'][0], FilesValue>;
}
