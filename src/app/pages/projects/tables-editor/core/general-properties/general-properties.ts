import type {
    DefaultDescriptions,
    DefaultDisplayNames,
} from '@tables-editor/pages/editable-table';

export interface GeneralProperties {
    displayNames: DefaultDisplayNames;
    descriptions: DefaultDescriptions;
    allowAnonymousVersionCreation: boolean | null;
}
