import type { MetaAttribute } from '@cache-server/api/versions/version';
import type { IconType } from '@main-shared/icon/icon-type';

export function getMetaAttributeIcon(attr: MetaAttribute): IconType {
    switch (attr) {
        case 'deleted':
            return 'boolean';
        case 'entryCreatedAt':
        case 'createdAt':
        case 'invalidatedAt':
            return 'date-time';
        case 'creatorId':
        case 'invalidatorId':
            return 'user';
    }
}
