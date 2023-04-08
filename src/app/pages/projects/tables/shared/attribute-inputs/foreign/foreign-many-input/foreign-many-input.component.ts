import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Input,
    Output,
} from '@angular/core';
import { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';
import { foreignValuesAreEmpty } from '@core/cache-client/api/edit-entries/inputs-values';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { getPresentForeignRelations } from '@shared/versions/display-version/foreign/get-present-foreign-relations';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ReplaySubject, of, Subject, combineLatest } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { chooseEntries } from '../../add-entries-modal/choose-entries';
import type { NewForeignEntry } from '../foreign-input-value';
import { ForeignInputValues } from '../foreign-input-value';
import { ForeignInputValuesProcessor } from '../foreign-input-values-processor';
import type { RemoveRelationArguments } from '../foreign-many-relation-input/remove-relation-arguments';
import type { UpdateValueArguments } from '../foreign-many-relation-input/update-value-arguments';

@Component({
    selector: 'app-foreign-many-input',
    templateUrl: './foreign-many-input.component.html',
    styleUrls: ['./foreign-many-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * the input for foreign relations
 * displays a list with cards for each relation + ability to add and remove relations
 * in addition to editing values of intermediateAttributes
 */
export class ForeignManyInputComponent
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
     * wether all inputs should be disabled
     */
    @Input() disabled = false;
    /**
     * Emits always when the value changes
     */
    @Output() readonly valueChange = new EventEmitter<
        ForeignInputValues | undefined
    >();

    get tableId(): UUID {
        return (this.version?.tableId ?? this.ids?.tableId)!;
    }

    get projectId(): UUID {
        return (this.version?.projectId ?? this.ids?.projectId)!;
    }

    readonly destroyed = new Subject();
    /**
     * the state of this component
     */
    public readonly foreignState = new State<any, State>(
        undefined,
        (changedChildren) =>
            changedChildren ||
            ForeignInputValuesProcessor.hasChanges(this.value)
    );
    /**
     * the intermediateTable of this foreignAttribute
     */
    public readonly intermediateTable$ = new ReplaySubject<IntermediateTable>(
        1
    );

    /**
     * Emits every time the filter for retrieving the numberOfPresentRelations changes
     */
    private readonly filterChanges$ = new Subject<unknown>();

    constructor(
        private readonly modalService: BsModalService,
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        const numberOfPresentRelations$ = new ReplaySubject<number>(1);
        combineLatest([this.intermediateTable$, this.filterChanges$])
            .pipe(
                switchMap(([intermediateTable]) => {
                    if (!this.version) {
                        // if the entry is newly created there are no presentRelations yet
                        return of(0);
                    }
                    return getPresentForeignRelations(
                        this.versionsService,
                        intermediateTable,
                        this.version,
                        this.attribute
                    ).pipe(map(({ totalVersionCount }) => totalVersionCount));
                }),
                takeUntil(this.destroyed)
            )
            .subscribe(numberOfPresentRelations$);
        this.foreignState.setAsyncValidators([
            (value) =>
                ForeignInputValuesProcessor.getAsyncValidator(
                    this.value,
                    this.attribute,
                    numberOfPresentRelations$
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
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            this.parentState.addChild(
                this.attribute.id,
                this.foreignState,
                false
            );
        }
        if (changes.value) {
            if (!this.value) {
                this.value = new ForeignInputValues();
            }
            this.foreignState.updateState(true, true);
            // remove the children that are now outdated - they will not get displayed anymore in the template -> marked as deleted
            setTimeout(() => this.foreignState.removeNotUpToDateChildren(), 0);
        }
        if (changes.version || changes.ids || changes.attribute) {
            this.filterChanges$.next(undefined);
        }
    }

    public async addNewRelations(intermediateTable: IntermediateTable) {
        const chosenEntries = await chooseEntries(
            this.attribute.kindOptions.foreign.tableId,
            this.projectId,
            this.modalService,
            this.attribute.kindOptions.relationshipMax
        );
        if (!chosenEntries) {
            return;
        }
        for (const entry of chosenEntries) {
            ForeignInputValuesProcessor.addNewRelation(
                this.value,
                intermediateTable,
                this.tableId,
                this.attribute,
                entry.entryId
            );
        }
        this.emitValue();
        this.changeDetectorRef.markForCheck();
    }

    public removeNewRelation(index: number) {
        ForeignInputValuesProcessor.removeNewRelation(this.value, index);
        this.emitValue();
    }

    public editNewRelation(
        index: number,
        changedIntermediateValues: NewForeignEntry['changedIntermediateValues']
    ) {
        ForeignInputValuesProcessor.editNewRelation(
            this.value,
            index,
            changedIntermediateValues
        );
        this.emitValue();
    }

    public removePresentRelation(
        args: RemoveRelationArguments,
        intermediateTable: IntermediateTable
    ) {
        if (!this.version) {
            return;
        }
        ForeignInputValuesProcessor.removePresentRelation(
            this.value,
            this.version,
            this.attribute,
            args,
            intermediateTable
        );
        this.emitValue();
    }

    public editPresentRelation(
        args: UpdateValueArguments,
        intermediateTable: IntermediateTable
    ) {
        if (!this.version) {
            return;
        }
        ForeignInputValuesProcessor.editPresentRelation(
            this.value,
            this.version,
            this.attribute,
            args,
            intermediateTable
        );
        this.emitValue();
    }

    public restorePresentRelation(intermediateEntryId: UUID) {
        ForeignInputValuesProcessor.restorePresentRelation(
            this.value,
            intermediateEntryId
        );
        this.emitValue();
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
