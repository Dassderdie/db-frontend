import type { UUID } from '@cache-server/api/uuid';

export type Version = InvalidatedVersion | ValidVersion;

export const metaAttributes: ReadonlyArray<MetaAttribute> = [
    'entryCreatedAt',
    'createdAt',
    'creatorId',
    'invalidatedAt',
    'invalidatorId',
    'deleted',
] as const;

export type MetaAttribute = Exclude<
    keyof InvalidatedVersion,
    | 'entryId'
    | 'id'
    | 'invalidationUpdateId'
    | 'projectId'
    | 'tableId'
    | 'updateId'
    | 'values'
>;

interface NormalVersion {
    readonly projectId: UUID;
    readonly tableId: UUID;
    readonly entryId: UUID;
    readonly id: UUID;
    readonly values: {
        readonly [attributeId: string]:
            | FilesValue
            | boolean
            | number
            | string
            | null;
    };
    readonly creatorId: UUID;
    readonly entryCreatedAt: string;
    readonly createdAt: string;
    readonly deleted?: boolean;
    /**
     * unique id for an update of an entry
     * -> get which foreign values have been changed during an update
     */
    readonly updateId?: UUID;
}

export interface FilesValue {
    readonly [fileName: string]: {
        readonly blobId: UUID;
        readonly blobInformation: {
            readonly creatorId: UUID;
            readonly rawSize: number;
        };
    };
}

interface ValidVersion extends NormalVersion {
    // To fix typechecking in version between InvalidatedVersion and NormalVersion https://github.com/microsoft/TypeScript/issues/12815
    readonly invalidatedAt: undefined;
    readonly invalidatorId: undefined;
    readonly invalidationUpdateId: undefined;
}

interface InvalidatedVersion extends NormalVersion {
    /**
     * when has the version been invalidated (a newer version has been created)
     */
    readonly invalidatedAt: string;
    /**
     * who has the version invalidated (created a newer version)
     */
    readonly invalidatorId: UUID;
    /**
     * the updateId of the update that invalidated this version
     */
    readonly invalidationUpdateId?: UUID;
}
