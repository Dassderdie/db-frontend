import type { Languages } from '@core/utility/i18n/languages';

export type DisplayName = Readonly<Languages<DisplayNameItem>>;

export interface DisplayNameItem<T extends string | null = string> {
    readonly singular: T;
    readonly plural?: T;
}

export type PessimisticDisplayNames = Languages<PessimisticDisplayNameItem>;

export interface PessimisticDisplayNameItem {
    readonly singular: string | null;
    readonly plural?: string | null;
}
