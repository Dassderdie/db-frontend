import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { Table } from '@cache-server/api/tables/table';

@Component({
    selector: 'app-overview-item',
    templateUrl: './overview-item.component.html',
    styleUrls: ['./overview-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewItemComponent {
    /**
     * the table which should be displayed here
     */
    @Input() table!: Table;
    /**
     * wether this table is in the favorites of the user
     */
    @Input() isFavorite!: boolean;
    /**
     * wether all the favoriteActions  (add to favorites, remove from favorites, ...)
     */
    @Input() disableFavoriteActions!: boolean;
    /**
     * wether the maximum number of favorite tables has been reached for the currently authenticated user in this project
     */
    @Input() maximumFavoriteTablesReached!: boolean;
    /**
     * emits each time when isFavorite should change
     */
    @Output() readonly isFavoriteChanges = new EventEmitter();
}
