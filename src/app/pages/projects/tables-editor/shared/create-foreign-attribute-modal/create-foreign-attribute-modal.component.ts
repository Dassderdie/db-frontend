import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { DisplayName } from '@cache-server/api/tables/display-name';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { DefaultDisplayNames } from '@tables-editor/pages/editable-table';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { colors } from 'src/app/style-variables';
import { EditableForeignAttribute } from '../edit-attribute/editable-attribute';

@Component({
    selector: 'app-create-foreign-attribute-modal',
    templateUrl: './create-foreign-attribute-modal.component.html',
    styleUrls: ['./create-foreign-attribute-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateForeignAttributeModalComponent
    extends Destroyed
    implements OnInit, AfterViewInit, OnDestroy
{
    /**
     * Must be set when opening the modal
     * the id of the currently selected table (if null the table isn't created yet)
     */
    public tableId!: UUID | null;
    /**
     * Must be set when opening the modal
     */
    public projectId!: UUID;
    /**
     * Wether the ForeignAttribute to be created is foreign-single or multiple
     */
    public isForeignSingle!: boolean;

    /**
     * Resolves when the foreignAttribute has been created
     * the value is the new foreignAttribute that should be send to the server
     */
    public readonly foreignAttributeCreated =
        new Subject<EditableForeignAttribute>();
    /**
     * Wether the AfterViewInit lifecycle has already passed
     */
    public viewInit = false;
    public selectedTableId?: UUID;
    public tables$ = new ReplaySubject<ReadonlyArray<Table>>(1);
    public readonly additionalGraphStyles: ReadonlyArray<cytoscape.StylesheetStyle> =
        [
            {
                selector: 'node.fromTable',
                style: {
                    'border-color': colors.primary,
                    'border-width': 3,
                    'border-opacity': 0.5,
                    'font-weight': 'bolder',
                },
            },
            {
                selector: 'edge.fromTable',
                style: {
                    'line-color': colors.primary,
                    width: 3,
                    opacity: 0.5,
                    // text decorations (underline) are not supported (See https://github.com/cytoscape/cytoscape.js/issues/1909)
                    'font-weight': 'bolder',
                    // for some odd reason all 4have to be specified...
                    'target-arrow-color': colors.primary,
                    'source-arrow-color': colors.primary,
                    'mid-target-arrow-color': colors.primary,
                    'mid-source-arrow-color': colors.primary,
                },
            },
            {
                selector: '.toTable',
                style: {
                    'font-weight': 'bolder',
                },
            },
        ];

    constructor(
        public readonly bsModalRef: BsModalRef,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.tablesService
            .getTables(this.projectId)
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.tables$);
    }

    ngAfterViewInit() {
        this.viewInit = true;
        this.changeDetectorRef.markForCheck();
    }

    public selectTable(selectedTableId: UUID) {
        this.selectedTableId = selectedTableId;
        if (this.tableId !== this.selectedTableId) {
            this.foreignAttributeCreated.next(
                new EditableForeignAttribute(
                    selectedTableId,
                    this.isForeignSingle
                )
            );
            this.bsModalRef.hide();
        } else {
            // TODO: remove this stuff to deal with additional options for self-referencing attributes
            // TODO: don't create default displayNames but let them empty
            const displayNames = new DefaultDisplayNames();
            displayNames[
                Object.keys(displayNames)[0] as keyof DisplayName
            ]!.singular = '???';
            this.foreignAttributeCreated.next(
                new EditableForeignAttribute(
                    selectedTableId,
                    this.isForeignSingle,
                    displayNames
                )
            );
            this.bsModalRef.hide();
        }
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
        this.foreignAttributeCreated.complete();
    }
}
