import type { OnChanges } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { IconType } from '@main-shared/icon/icon-type';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';

@Component({
    selector: 'app-file-sort-btn',
    templateUrl: './file-sort-btn.component.html',
    styleUrls: ['./file-sort-btn.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSortBtnComponent implements OnChanges {
    /**
     * The key after which currently is sorted
     */
    @Input() sortKey!: SortKey;
    /**
     * The key which this button represents
     */
    @Input() key!: SortKey;
    @Input() sortOrder!: -1 | 1;

    public sortIconType: IconType = 'sort';

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        let base;
        switch (this.key) {
            case 'name':
                base = 'sort-string';
                break;
            case 'size':
                base = 'sort-number';
                break;
            case 'creator':
            default:
                base = 'sort';
        }
        if (this.sortKey !== this.key) {
            this.sortIconType = base as IconType;
        } else {
            this.sortIconType = `${base}-${
                this.sortOrder === 1 ? 'asc' : 'desc'
            }` as IconType;
        }
    }
}

type SortKey = 'creator' | 'name' | 'size';
