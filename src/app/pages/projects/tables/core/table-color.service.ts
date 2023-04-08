import { Injectable } from '@angular/core';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { values } from 'lodash-es';

@Injectable({
    providedIn: 'root',
})
export class TableColorService {
    public getColor(table: Table): string {
        if (!this.tableColorCache[table.projectId]) {
            this.tableColorCache[table.projectId] = {};
        }
        const cachedTableColors = this.tableColorCache[table.projectId]!;
        if (!cachedTableColors[table.id]) {
            cachedTableColors[table.id] = this.getNewColor(
                table.id,
                cachedTableColors
            );
        }
        return cachedTableColors[table.id]!;
    }

    private tableColorCache: {
        [projectId: string]: {
            [tableId: string]: string;
        };
    } = {};

    // See https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
    private getNewColor(
        tableId: UUID,
        cachedTableColors: Readonly<{ [tableId: string]: string }>
    ): string {
        const startIndex = this.uuidToNumber(tableId);
        let index = startIndex;
        while (
            values(cachedTableColors).includes(
                colors[index % colors.length]!
            ) &&
            // to prevent an endless loop - in this case a collision occurs instead
            index <= startIndex + colors.length
        ) {
            index++;
        }
        return colors[index % colors.length]!;
    }

    private uuidToNumber(uuid: UUID): number {
        return [...uuid.replace(/-/gu, '')]
            .map((character) => character.charCodeAt(0))
            .reduce((a, b) => a + b, 0);
    }
}

// https://en.wikipedia.org/wiki/Help:Distinguishable_colors
const colors = [
    '#0075DC',
    '#993F00',
    '#4C005C',
    '#191919',
    '#005C31',
    '#2BCE48',
    '#FFCC99',
    '#808080',
    '#94FFB5',
    '#8F7C00',
    '#9DCC00',
    '#C20088',
    '#003380',
    '#FFA405',
    '#FFA8BB',
    '#426600',
    '#FF0010',
    '#5EF1F2',
    '#00998F',
    '#740AFF',
    '#990000',
    '#FF5005',
];
