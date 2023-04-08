import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
    ChangeDetectorRef,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';
import { foreignValuesAreEmpty } from '@core/cache-client/api/edit-entries/inputs-values';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Breakpoints } from '@core/utility/window-values/breakpoints';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, ReplaySubject, combineLatest } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { getPresentForeignRelations } from '@shared/versions/display-version/foreign/get-present-foreign-relations';
import { getForeignEntryId } from '@shared/utility/functions/get-foreign-entry-id';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import { ForeignInputValues } from '../foreign-input-value';
import { chooseEntries } from '../../add-entries-modal/choose-entries';
import { ForeignInputValuesProcessor } from '../foreign-input-values-processor';

@Component({
    selector: 'app-foreign-single-input',
    templateUrl: './foreign-single-input.component.html',
    styleUrls: ['./foreign-single-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * an input for an single-foreign-attribute (an foreign-attribute without intermediateAttributes and relationshipMax === 1)
 */
export class ForeignSingleInputComponent
    extends Destroyed
    implements OnInit, OnDestroy, OnChanges
{
    /**
     * has to be specified if there is no version created yet/a new version should be created
     */
    @Input() ids?: {
        /**
         * the id of the project the table with the here specified attributes is in
         */
        projectId: UUID;
        /**
         * the id of the table/intermediateTable the specified attributes belong to
         */
        tableId: UUID;
    };
    /**
     * the latest version of the entry that should be edited
     */
    @Input() version?: Version;
    /**
     * the foreign-attribute whose values this input should alter
     */
    @Input() attribute!: ForeignAttribute;
    /**
     * the changed values of the relations
     */
    @Input() value: ForeignInputValues = new ForeignInputValues();
    /**
     * the state of the parent component
     */
    @Input() parentState!: State;
    /**
     * wether this input should be disabled
     */
    @Input() disabled = false;
    /**
     * Emits always when the value changes
     */
    @Output() readonly valueChange = new EventEmitter<ForeignInputValues>();

    // To use it in template
    public readonly breakpoints = Breakpoints;
    /**
     * the state of this input
     */
    public readonly foreignState = new State<any, State>(
        undefined,
        (changedChildren) =>
            changedChildren ||
            ForeignInputValuesProcessor.hasChanges(this.value)
    );
    /**
     * the intermediateTable the foreignAttribute refers to
     */
    private intermediateTable?: IntermediateTable;
    private readonly intermediateTable$ = new ReplaySubject<IntermediateTable>(
        1
    );
    /**
     * the id of the attribute of the intermediateTable, the foreignAttribute connects to
     */
    public foreignEntryAttributeId?: UUID;
    /**
     * Emits every time the filter for retrieving the intermediateVersions changes
     */
    private readonly filterChanges$ = new ReplaySubject<unknown>(1);

    public get projectId(): UUID {
        return this.version ? this.version.projectId : this.ids!.projectId;
    }

    private get tableId(): UUID {
        return this.version ? this.version.tableId : this.ids!.tableId;
    }

    private presentIntermediateVersion?: Version | null;
    public readonly presentIntermediateVersion$ =
        new ReplaySubject<Version | null>(1);
    public readonly numberOfPresentRelations$ = new ReplaySubject<number>(1);

    constructor(
        private readonly modalService: BsModalService,
        private readonly versionsService: VersionsService,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        const getIntermediateVersions$ = combineLatest([
            this.intermediateTable$,
            this.filterChanges$,
        ]).pipe(
            switchMap(([intermediateTable]) => {
                if (!this.version) {
                    // if the entry is newly created there are no presentRelations yet
                    return of({
                        versions: [],
                        totalVersionCount: 0,
                    });
                }
                return getPresentForeignRelations(
                    this.versionsService,
                    intermediateTable,
                    this.version,
                    this.attribute
                );
            })
        );
        // get the versions
        getIntermediateVersions$
            .pipe(takeUntil(this.destroyed))
            .subscribe((intermediateVersionsResult) => {
                this.numberOfPresentRelations$.next(
                    intermediateVersionsResult.totalVersionCount
                );
                this.presentIntermediateVersion =
                    intermediateVersionsResult.versions[0];
                this.presentIntermediateVersion$.next(
                    this.presentIntermediateVersion!
                );
            });
        this.foreignState.setAsyncValidators([
            () =>
                ForeignInputValuesProcessor.getAsyncValidator(
                    this.value,
                    this.attribute,
                    this.numberOfPresentRelations$
                ),
        ]);
        this.tablesService
            .getTable<IntermediateTable>(
                // these don't change
                this.projectId,
                this.attribute.kindOptions.intermediateTableId
            )
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.intermediateTable$);
        this.intermediateTable$
            .pipe(takeUntil(this.destroyed))
            .subscribe((table) => {
                this.intermediateTable = table;
                this.foreignEntryAttributeId = getForeignEntryAttributeIds(
                    this.intermediateTable,
                    this.tableId,
                    this.attribute.id
                ).foreignEntryAttributeId;
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            this.parentState.addChild(
                this.attribute.id,
                this.foreignState,
                true
            );
        }
        if (changes.value) {
            if (!this.value) {
                this.value = new ForeignInputValues();
            }
            this.foreignState.updateState(true, true);
        }
        if (changes.version || changes.ids || changes.attribute) {
            this.filterChanges$.next(undefined);
        }
    }

    /**
     * adds new relations to the value
     */
    public async chooseRelation() {
        const chosenEntries = await chooseEntries(
            this.attribute.kindOptions.foreign.tableId,
            this.projectId,
            this.modalService,
            1
        );
        if (!chosenEntries) {
            return;
        }
        const newEntryId = chosenEntries[0]?.entryId;
        // If no entry has been chosen
        if (!newEntryId) {
            return;
        }
        this.value = new ForeignInputValues();
        // restoring the present relation is better than creating a new one
        if (
            newEntryId !==
            this.presentIntermediateVersion?.values[
                this.foreignEntryAttributeId!
            ]
        ) {
            this.addValue(newEntryId);
            this.removePresentRelation();
        }
        this.emitValue();
        this.changeDetectorRef.markForCheck();
    }

    public clear() {
        if (!this.attribute.required) {
            this.value = new ForeignInputValues();
            this.removePresentRelation();
            this.emitValue();
        }
    }

    private removePresentRelation() {
        // there are no present relations if you create a new entry
        if (!this.version) {
            return;
        }
        if (!this.intermediateTable || !this.presentIntermediateVersion) {
            return;
        }
        ForeignInputValuesProcessor.removePresentRelation(
            this.value,
            this.version,
            this.attribute,
            {
                foreignEntryId: getForeignEntryId(
                    this.presentIntermediateVersion.values,
                    true,
                    this.intermediateTable,
                    this.tableId,
                    this.attribute.id
                ),
                intermediateEntryId: this.presentIntermediateVersion.entryId,
            },
            this.intermediateTable
        );
    }

    private addValue(foreignEntryId: UUID) {
        if (!this.intermediateTable) {
            errors.error({
                message: 'The intermediateTable has to be specified!',
            });
            return;
        }
        ForeignInputValuesProcessor.addNewRelation(
            this.value,
            this.intermediateTable,
            this.tableId,
            this.attribute,
            foreignEntryId
        );
    }

    private emitValue() {
        this.value = { ...this.value };
        // because of adding or removing values the valid/changed-state could have changed
        this.foreignState.updateState(true, true);
        this.valueChange.emit(
            foreignValuesAreEmpty(this.value) ? undefined : this.value
        );
    }

    ngOnDestroy() {
        this.foreignState.destroy();
        this.parentState.removeNotUpToDateChildren();
        this.destroyed.next(undefined);
    }
}
