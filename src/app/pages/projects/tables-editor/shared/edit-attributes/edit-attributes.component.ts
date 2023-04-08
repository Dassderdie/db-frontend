import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type {
    Attribute,
    ForeignAttribute,
} from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { cloneDeep, isEqual } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { createForeignAttribute } from '../create-foreign-attribute-modal/create-foreign-attribute';
import type { EditableAttribute } from '../edit-attribute/editable-attribute';
import {
    EditableStringAttribute,
    EditableNumberAttribute,
    EditableBooleanAttribute,
    EditableUrlAttribute,
    EditableEMailAttribute,
    EditableTimeAttribute,
    EditableDateAttribute,
    EditableDateTimeAttribute,
    EditableFilesAttribute,
} from '../edit-attribute/editable-attribute';

@Component({
    selector: 'app-edit-attributes',
    templateUrl: './edit-attributes.component.html',
    styleUrls: ['./edit-attributes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAttributesComponent
    extends Destroyed
    implements OnDestroy, OnChanges, OnInit
{
    /**
     * the id of the table/intermediateTable these attributes belong to
     * if the table hasn't been created yet null is passed
     */
    @Input() tableId!: UUID | null;
    @Input() initialAttributes!: ReadonlyArray<DeepReadonly<EditableAttribute>>;
    @Input() attributes!: ReadonlyArray<EditableAttribute>;
    @Input() parentState!: State;
    @Input() minAttributes = 1;
    /**
     * Emits every time the attributes array or one of the attributes properties changes
     * the new attributesArray (with new reference)
     */
    @Output() readonly attributesChange = new EventEmitter<
        ReadonlyArray<EditableAttribute>
    >();
    /**
     * Emits always when the changes should be saved (e.g. directed, self-referencing foreign-relations,
     * whose second attribute should be created by the backend)
     */
    @Output() readonly saveChanges = new EventEmitter<unknown>();

    /**
     * the currently chosen attribute to edit
     * undefined: you have to choose one
     * string: attribute.id of an attribute in currentTableValues
     */
    public selectedAttribute?: UUID;
    public readonly attributeKinds: ReadonlyArray<
        Exclude<Attribute['kind'], 'foreign'>
    > = [
        'string',
        'number',
        'boolean',
        'url',
        'email',
        'time',
        'date',
        'date-time',
        'files',
        // 'foreign' is not in here because there is another button for it
    ];
    public readonly foreignAttributeKinds = [
        'foreignMultiple',
        'foreignSingle',
    ] as const;
    public attributesState!: State;
    public attributesOrderChanged = false;

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.attributesState.setValidators([
            (value) =>
                this.attributes.length < this.minAttributes
                    ? {
                          minAttributes: {
                              translationKey: _(
                                  'pages.tablesEditor.noAttributes'
                              ),
                          },
                      }
                    : null,
        ]);
        this.attributesState.updateChangedFunction(
            (changedChildren) => changedChildren || this.attributesOrderChanged
        );
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            const id = 'attributes';
            if (this.parentState.children[id]) {
                this.attributesState = this.parentState.children[id] as State;
                this.attributesState.upToDate = true;
            } else {
                this.attributesState = new State();
                this.parentState.addChild(id, this.attributesState);
            }
        }
        if (changes.attributes) {
            // Loop through all state children and remove all now unused ones
            for (const key of Object.keys(this.attributesState.children)) {
                if (
                    key.startsWith('attribute') &&
                    !this.attributes.some(
                        (attr) => `attribute${attr.id}` === key
                    )
                ) {
                    // eslint-disable-next-line unicorn/prefer-dom-node-remove
                    this.attributesState.removeChild(key);
                }
                // TODO: if an attribute is not open and resetted the state should reset too...
            }
            this.updateAttributesOrderChanged();
        }
    }

    public moveAttr(event: CdkDragDrop<ReadonlyArray<UUID>>) {
        if (event.previousIndex === event.currentIndex) {
            return;
        }
        const newAttributes = [...this.attributes];
        moveItemInArray(newAttributes, event.previousIndex, event.currentIndex);
        this.setAttributes(newAttributes);
    }

    /**
     * adds a foreign attribute
     * if the foreignAttribute is directed & self-referencing all changes will be saved
     * (to deal with the automatically created second foreign-attribute)
     */
    public addForeignAttribute(isForeignSingle: boolean) {
        this.activatedRoute
            .parent!.params.pipe(
                switchMap((params) =>
                    createForeignAttribute(
                        params.project,
                        this.tableId,
                        isForeignSingle,
                        this.bsModalService
                    )
                ),
                take(1),
                takeUntil(this.destroyed)
            )
            .subscribe((foreignAttribute) => {
                this.addAttribute(foreignAttribute);
                if (
                    this.tableId ===
                    foreignAttribute.kindOptions.foreign.tableId
                ) {
                    // TODO: check "directed"
                    // if the foreignAttribute is directed & self-referencing all changes will be saved
                    //  (to deal with the automatically created second foreign-attribute)
                    this.saveChanges.next(null);
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    public createNewAttribute(
        kind: Exclude<Attribute['kind'], ForeignAttribute['kind']>
    ) {
        let newAttribute: EditableAttribute;
        switch (kind) {
            case 'string':
                newAttribute = new EditableStringAttribute();
                break;
            case 'number':
                newAttribute = new EditableNumberAttribute();
                break;
            case 'boolean':
                newAttribute = new EditableBooleanAttribute();
                break;
            case 'url':
                newAttribute = new EditableUrlAttribute();
                break;
            case 'email':
                newAttribute = new EditableEMailAttribute();
                break;
            case 'time':
                newAttribute = new EditableTimeAttribute();
                break;
            case 'date':
                newAttribute = new EditableDateAttribute();
                break;
            case 'date-time':
                newAttribute = new EditableDateTimeAttribute();
                break;
            case 'files':
                newAttribute = new EditableFilesAttribute();
                break;
            default:
                errors.error({
                    message: `There is no attribute-kind called: ${kind}`,
                });
                return;
        }
        this.addAttribute(newAttribute);
    }

    private addAttribute(newAttribute: EditableAttribute) {
        this.setAttributes([...this.attributes, newAttribute]);
        this.selectedAttribute = newAttribute.id;
        // Only update invalidState, because changed is already called by updateAttributesOrderChanged()
        this.attributesChange.emit(this.attributes);
    }

    /**
     * removes the attribute with attributeId from currentTableValues
     * @param attributeId
     */
    public removeAttribute(attributeId: UUID) {
        /**
         * if a self-referencing foreignAttribute should be removed it's counterpart should be removed too,
         * this is the attribute id of this counterpart (null if the attribute isn't a self-referencing foreignAttribute)
         */
        let counterpartId: UUID | null = null;
        const newAttributes = [...this.attributes];
        const i = newAttributes.findIndex((attr) => attr.id === attributeId);
        const attribute = newAttributes[i]!;
        // if the attribute is a self-referencing foreignAttribute
        if (
            attribute.kind === 'foreign' &&
            attribute.kindOptions.foreign.tableId === this.tableId
        ) {
            counterpartId = attribute.kindOptions.foreign.attributeId;
        }
        newAttributes.splice(i, 1);
        // remove the counterpart in the same table too
        const counterpartIndex = newAttributes.findIndex(
            (attr) => attr.id === counterpartId
        );
        if (counterpartIndex >= 0) {
            newAttributes.splice(counterpartIndex, 1);
        }
        this.setAttributes(newAttributes);
        this.attributesState.removeChild(`attribute${attributeId}`);
        if (counterpartId) {
            this.attributesState.removeChild(`attribute${counterpartId}`);
        }
        this.selectedAttribute = undefined;
        this.attributesChange.emit(this.attributes);
    }

    /**
     * updates the value of an attribute
     * @param index index in the attributes-array of the attribute
     * @param newAttributeValue the new value of the attribute
     */
    public updateAttribute(
        index: number,
        newAttributeValue: EditableAttribute
    ) {
        const newAttributes = [...this.attributes];
        newAttributes[index] = newAttributeValue;
        // check if the attribute is a self-referencing foreignAttribute
        if (
            newAttributeValue.kind === 'foreign' &&
            newAttributeValue.kindOptions.foreign.tableId === this.tableId
        ) {
            // get the counterpart attribute in this table
            const counterpartAttributeIndex = newAttributes.findIndex(
                (attribute) =>
                    attribute.id ===
                    newAttributeValue.kindOptions.foreign.attributeId
            );
            const counterpartAttribute =
                newAttributes[counterpartAttributeIndex];
            errors.assert(counterpartAttribute?.kind === 'foreign');
            // synchronize the values accordingly
            counterpartAttribute.kindOptions.foreign.relationshipMax =
                newAttributeValue.kindOptions.relationshipMax;
            counterpartAttribute.kindOptions.foreign.relationshipMin =
                newAttributeValue.kindOptions.relationshipMin;
            counterpartAttribute.kindOptions.relationshipMax =
                newAttributeValue.kindOptions.foreign.relationshipMax ?? null;
            counterpartAttribute.kindOptions.relationshipMin =
                newAttributeValue.kindOptions.foreign.relationshipMin ?? null;
            counterpartAttribute.kindOptions.intermediateAttributes =
                newAttributeValue.kindOptions.intermediateAttributes;
            // trigger changeDetection
            newAttributes[counterpartAttributeIndex] =
                cloneDeep(counterpartAttribute);
            // TODO: States: proof of concept for retrieving a state is done
            // -> the intermediateAttributeStates should be synchronized too
            // const attrState: State | undefined = this.attributesState
            //     .children[
            //     EditAttributeComponent.generateStateId(newAttributeValue.id)
            // ];
        }
        this.setAttributes(newAttributes);
    }

    private setAttributes(newAttributes: ReadonlyArray<EditableAttribute>) {
        this.attributes = newAttributes;
        this.attributesChange.emit(this.attributes);
        // calls updateState
        this.updateAttributesOrderChanged();
    }

    /**
     * updates the value of attributesOrderChanged
     * calls updateState
     */
    private updateAttributesOrderChanged() {
        const newAttributesOrderChanged = !isEqual(
            this.attributes.map((attribute) => attribute.id),
            this.initialAttributes.map((attribute) => attribute.id)
        );
        if (this.attributesOrderChanged !== newAttributesOrderChanged) {
            this.attributesOrderChanged = newAttributesOrderChanged;
        }
        this.attributesState.updateState(true, true);
    }

    ngOnDestroy() {
        this.attributesState.upToDate = false;
        this.destroyed.next(undefined);
    }
}
