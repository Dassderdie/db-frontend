import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import type { IconType } from '@main-shared/icon/icon-type';

@Pipe({
    name: 'getSortIcon',
})
export class GetSortIconPipe implements PipeTransform {
    /**
     * @param attributeKey
     * @param sortingKey
     * @param sortingOrder
     * @param attr the attribute for which the sortingIcon should be supplied
     * (if not specified the attribute is a metaAttribute)
     */
    transform(
        attributeKey: UUID,
        sortingKey?: UUID | null,
        sortingOrder?: 'ascending' | 'descending' | null,
        attr?: Attribute | null
    ):
        | {
              type: IconType;
              grey: boolean;
          }
        | undefined {
        const grey = attributeKey !== sortingKey;
        if (attr) {
            if (attr.kind === 'foreign') {
                // foreign attribute
                return undefined;
            }
            let prefix = 'sort';
            if (
                attr.kind === 'string' ||
                attr.kind === 'boolean' ||
                attr.kind === 'number'
            ) {
                prefix += `-${attr.kind}`;
            }
            if (sortingKey === attributeKey) {
                if (sortingOrder === 'ascending') {
                    return {
                        type: `${prefix}-asc` as IconType,
                        grey,
                    };
                }
                if (sortingOrder === 'descending') {
                    return {
                        type: `${prefix}-desc` as IconType,
                        grey,
                    };
                }
            }
            return {
                type: prefix as IconType,
                grey,
            };
        }
        // metaAttribute
        if (sortingKey === attributeKey) {
            if (sortingOrder === 'ascending') {
                return {
                    type: 'sort-asc',
                    grey,
                };
            }
            if (sortingOrder === 'descending') {
                return {
                    type: 'sort-desc',
                    grey,
                };
            }
        }
        return {
            type: 'sort',
            grey,
        };
    }
}
