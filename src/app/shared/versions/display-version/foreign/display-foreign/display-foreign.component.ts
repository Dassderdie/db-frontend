import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectorRef,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import { Version } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { merge, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { presentForeignRelationsFilter } from '../present-foreign-relations-filter';

@Component({
    selector: 'app-display-foreign',
    templateUrl: './display-foreign.component.html',
    styleUrls: ['./display-foreign.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * displays a foreign value
 */
export class DisplayForeignComponent
    extends Destroyed
    implements OnChanges, OnDestroy
{
    /**
     * the foreignAttribute whose value should be displayed
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the version from which the foreign value should be displayed
     */
    @Input() version!: Version;
    /**
     * whether there is not enough space to display all foreign-many relations (true)
     * or there is just a single foreign relation without intermediateAttributes expected (false)
     */
    @Input() small = false;

    /**
     * the maximum number of relations displayed
     */
    public readonly displayLimit = 3;

    constructor(
        private readonly versionsService: VersionsService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    public intermediateTable?: IntermediateTable;
    private readonly reload = new Subject();
    /**
     * an array of the relations
     * with the maximal length of displayLimit
     */
    intermediateVersions?: Version[];
    /**
     * number of the relations
     */
    numberOfTotalRelations?: number;

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.version || changes.attribute) {
            this.reload.next(undefined);
            // All foreign-relations of a deleted version are or or will be deleted
            if (!this.version.deleted) {
                this.updateResults();
            }
        }
    }

    private updateResults() {
        this.tablesService
            .getTable(
                this.version.projectId,
                this.attribute.kindOptions.intermediateTableId
            )
            .pipe(
                switchMap((table) => {
                    errors.assert(table.type === 'intermediate');
                    this.intermediateTable = table;
                    // the id of the attribute of the intermediate table, that belongs to the entryId
                    const ownAttributeId = getForeignEntryAttributeIds(
                        this.intermediateTable,
                        this.version.tableId,
                        this.attribute.id
                    ).entryAttributeId;
                    return this.versionsService.getVersions(
                        this.version.projectId,
                        this.attribute.kindOptions.intermediateTableId,
                        JSON.stringify(
                            presentForeignRelationsFilter(
                                ownAttributeId,
                                this.version
                            )
                        )
                    );
                }),
                takeUntil(merge(this.destroyed, this.reload))
            )
            .subscribe({
                next: (results) => {
                    this.intermediateVersions = results.versions.slice(
                        0,
                        this.displayLimit
                    );
                    this.numberOfTotalRelations = results.totalVersionCount;
                    this.changeDetectorRef.markForCheck();
                },
                error: (error: any) => errors.error({ error }),
            });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
