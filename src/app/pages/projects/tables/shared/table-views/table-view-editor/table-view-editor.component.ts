import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    Output,
} from '@angular/core';
import { TableView } from '@cache-server/api/roles/table-view';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { State } from '@shared/utility/classes/state/state';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { isEqual } from 'lodash-es';
import type { DeepWritable } from '@shared/utility/types/writable';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';

@Component({
    selector: 'app-table-view-editor',
    templateUrl: './table-view-editor.component.html',
    styleUrls: ['./table-view-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableViewEditorComponent implements OnChanges, OnDestroy {
    /**
     * The tableView that should be edited
     * !deepClone it before if you don't want to alter the references!
     */
    @Input() initialTableView!: TableView;
    /**
     * The available attributes
     */
    @Input() attributes!: ReadonlyArray<Attribute>;
    @Input() parentState!: State;
    @Output() readonly tableViewChanges = new EventEmitter<
        DeepWritable<TableView>
    >();

    public readonly viewEditorState = new State(
        undefined,
        () => !isEqual(this.initialTableView, this.tableView),
        [
            (v: any) =>
                !this.tableView ||
                this.tableView.orderedAttributeIds.length >= 1
                    ? null
                    : {
                          minOrderedAttributeIds: {
                              translationKey: _(
                                  'pages.tables.table-views.table-views-editor.min-ordered-attributes-error'
                              ),
                          },
                      },
        ]
    );
    /**
     * The tableView that should be edited
     */
    public tableView!: DeepWritable<TableView>;

    /**
     * The Ids of attributes that are currently not in the tableView and can be added
     */
    public addableAttributeIds: UUID[] = [];

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            this.parentState.addChild('viewEditor', this.viewEditorState);
        }
        if (!this.tableView) {
            this.resetTableView();
        }
        if (changes.attributes) {
            // remove attributIds in tableView that are no longer in attributes
            this.tableView!.orderedAttributeIds =
                this.tableView!.orderedAttributeIds.filter((attrId) => {
                    if (this.attributes.some((attr) => attr.id === attrId)) {
                        return true;
                    }
                    console.log(
                        `Attribute ${attrId} has been removed from the view.`
                    );
                    return false;
                });
            this.generateAddableAttributeIds();
        }
        if (changes.initialTableView || changes.tableView) {
            this.viewEditorState.updateState(true, true);
        }
    }

    public addAttribute(id: UUID) {
        this.tableView!.orderedAttributeIds.push(id);
        this.generateAddableAttributeIds();
        this.viewEditorState.updateState(true, true);
        this.tableViewChanges.emit(this.tableView);
    }

    public removeAttribute(id: UUID) {
        this.tableView!.orderedAttributeIds =
            this.tableView!.orderedAttributeIds.filter(
                (attrId) => attrId !== id
            );
        // shortcut for generateAddableAttributeIds()
        this.addableAttributeIds.push(id);
        this.viewEditorState.updateState(true, true);
        this.tableViewChanges.emit(this.tableView);
    }

    public moveAttr(event: CdkDragDrop<string[]>) {
        if (event.previousIndex !== event.currentIndex) {
            moveItemInArray(
                this.tableView!.orderedAttributeIds,
                event.previousIndex,
                event.currentIndex
            );
            this.viewEditorState.updateState(true, true);
            this.tableViewChanges.emit(this.tableView);
        }
    }

    public resetTableView() {
        this.tableView = cloneDeepWritable(this.initialTableView);
        this.generateAddableAttributeIds();
        this.tableViewChanges.emit(this.tableView);
    }

    private generateAddableAttributeIds() {
        // update the addableAttributeIds
        this.addableAttributeIds = this.attributes
            .filter(
                (attr) =>
                    !this.tableView!.orderedAttributeIds.includes(attr.id) &&
                    !attr.hidden
            )
            .map((attr) => attr.id);
    }

    ngOnDestroy() {
        this.viewEditorState.destroy();
    }
}
