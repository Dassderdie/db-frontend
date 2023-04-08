import type { UUID } from '@cache-server/api/uuid';
import type { User } from '../users/user';
import type { FilterGroup } from '../versions/filter-group';
import type { MetaAttribute } from '../versions/version';
import type { TableView } from './table-view';

/**
 * The association of a user with a project
 */
export interface Role {
    readonly id: UUID;
    readonly projectId: UUID;
    readonly userId: UUID;
    readonly inviteUsers: boolean;
    readonly givePermissions: boolean;
    readonly administrator: boolean;
    readonly creatorId: UUID;
    readonly createdAt: string;
    readonly revokedAt?: string;
    readonly revokerId?: UUID;
    readonly updatedAt?: string;
    readonly user: User;
    readonly preferences: {
        readonly favoriteTables: ReadonlyArray<UUID>;
        readonly tableViews: { readonly [tableId: string]: TableView };
        readonly filters: FiltersPreferences;
        readonly columnOrders: ColumnOrdersPreferences;
    };
}

export interface FiltersPreferences {
    readonly [tableId: string]: FiltersPreference;
}
export type FiltersPreference = ReadonlyArray<FilterPreference>;
export interface FilterPreference {
    /**
     * This filter is advanced and cleaned
     */
    readonly filter: FilterGroup | null;
    readonly name: string;
}

export interface ColumnOrdersPreferences {
    readonly [tableId: string]: ColumnOrdersPreference;
}
export type ColumnOrdersPreference = ReadonlyArray<ColumnOrderPreference>;
export interface ColumnOrderPreference {
    readonly attributeOrder: ReadonlyArray<MetaAttribute | UUID>;
    readonly name: string;
}

export const maximumNumberOfFilterPreferences = 20;
export const maximumNumberOfColumnOrdersPreferences = 20;
