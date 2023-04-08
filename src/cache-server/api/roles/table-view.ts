import type { UUID } from '../uuid';

export interface TableView {
    readonly orderedAttributeIds: ReadonlyArray<UUID>;
}
