import type { AttributeFilter } from './attribute-filter';

export interface FilterGroup {
    readonly type: 'and' | 'nand' | 'nor' | 'or';
    readonly expressions: ReadonlyArray<AttributeFilter | FilterGroup>;
}

export function isFilterGroup(
    filter: FilterGroup['expressions'][0]
): filter is FilterGroup {
    return (
        filter.type === 'and' ||
        filter.type === 'or' ||
        filter.type === 'nand' ||
        filter.type === 'nor'
    );
}
