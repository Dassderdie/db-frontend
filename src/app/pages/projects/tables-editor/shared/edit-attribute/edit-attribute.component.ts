import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Input,
    Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type {
    ForeignAttribute,
    Attribute,
} from '@cache-server/api/tables/attribute';
import {
    EditableAttribute,
    EditableBooleanAttribute,
    EditableDateAttribute,
    EditableDateTimeAttribute,
    EditableEMailAttribute,
    EditableFilesAttribute,
    EditableForeignAttribute,
    EditableNumberAttribute,
    EditableStringAttribute,
    EditableTimeAttribute,
    EditableUrlAttribute,
} from '@tables-editor/shared/edit-attribute/editable-attribute';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { Form } from '@shared/inputs/form';
import type { InputControl } from '@shared/inputs/input-control';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { Validator } from '@shared/utility/classes/state/validator-state';
import { setProperty } from '@shared/utility/functions/set-property';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { AttributeOption } from '@tables-editor/core/attribute-option';
import { AttributeOptionsService } from '@tables-editor/core/attribute-options.service';
import type { Observable } from 'rxjs';
import { skip, switchMap, takeUntil } from 'rxjs/operators';
import { cloneDeepWritable } from '@shared/utility/functions/clone-deep-writable';
import { DeepReadonly } from '@shared/utility/types/deep-readonly';
import { validateAttribute } from './validate-attribute';

@Component({
    selector: 'app-edit-attribute',
    templateUrl: './edit-attribute.component.html',
    styleUrls: ['./edit-attribute.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * a collapsible card in which all necessary forms for editing the properties of one attribute are located
 */
export class EditAttributeComponent
    extends Destroyed
    implements OnChanges, OnInit, OnDestroy
{
    /**
     * the initial value of the attribute (e.g. to determine changed status)
     * if a falsy value is provided a default value is used according to the attribute-kind of the attribute
     * attribute.id and attribute.kind have to stay the same after initialisation
     */
    @Input() initialAttribute!: DeepReadonly<EditableAttribute>;
    /**
     * the current value of the attribute
     * attribute.id and attribute.kind have to stay the same after initialisation
     */
    @Input() attribute!: EditableAttribute;
    /**
     * the state of the parent component
     * the id of the child is always 'attribute' + attribute.id
     */
    @Input() parentState!: State;
    /**
     * wether this attribute is not collapsed and the inputs should be displayed
     */
    @Input() open = false;
    /**
     * wether this attribute is the first in the list
     * (to choose the correct border radii)
     */
    @Input() top = true;
    /**
     * wether this attribute is the last in the list
     * (to choose the correct border radii)
     */
    @Input() bottom = true;
    /**
     * emits the current value when the current value of the attribute changes
     */
    @Output() readonly attributeChange = new EventEmitter<EditableAttribute>();
    /**
     * emits when the attribute should be closed (false) or opened (true)
     */
    @Output() readonly openChange = new EventEmitter<boolean>();
    /**
     * emits when the attribute should be removed
     */
    @Output() readonly removeAttribute = new EventEmitter();
    /**
     * Emits always when the changes should be saved (e.g. directed, self-referencing foreign-relations,
     * whose second attribute should be created by the backend)
     */
    @Output() readonly saveChanges = new EventEmitter<unknown>();

    constructor(
        private readonly attributeOptionsService: AttributeOptionsService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    public attributeState!: State;
    /**
     * the table to which the foreign attribute connects
     * -> this property is only set if this is a foreign attribute
     */
    public foreignTable?: Table;
    public kindOptionsForm?: Form;
    /**
     * the number of non validator options
     */
    public numberOfNonValidatorOptions = 0;

    /**
     * a dictionary to get the keys for accessing the attribute value
     * for a control in the kindOptionsForm
     */
    private controlNameKeysDict: DeepReadonly<{
        [controlId: string]: AttributeOption['keys'];
    }> = {};

    private readonly attributeStateValidators: ReadonlyArray<Validator<any>> = [
        // the State doesn't have the attribute's value
        () => validateAttribute(this.attribute),
    ];

    static generateStateId(attributeId: UUID) {
        return `attribute${attributeId}`;
    }

    ngOnInit() {
        if (this.attribute.kind === 'foreign') {
            // get the displayName of the connected Table
            this.activatedRoute
                .parent!.params.pipe(
                    switchMap((params) =>
                        this.tablesService.getTable(
                            params.project,
                            (this.attribute as ForeignAttribute).kindOptions
                                .foreign.tableId
                        )
                    ),
                    takeUntil(this.destroyed)
                )
                .subscribe((table) => {
                    this.foreignTable = table;
                    this.changeDetectorRef.markForCheck();
                });
        }
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            const id = EditAttributeComponent.generateStateId(
                this.attribute.id
            );
            if (this.parentState.children[id]) {
                this.attributeState = this.parentState.children[id] as State;
                this.attributeState.upToDate = true;
            } else {
                this.attributeState = new State(
                    undefined,
                    undefined,
                    this.attributeStateValidators
                );
                this.parentState.addChild(id, this.attributeState);
            }
        }
        if (!this.initialAttribute) {
            errors.assert(this.attribute.editingType === 'new');
            const id = this.attribute.id;
            // Create the initialAttribute if it is newly created and therefore not provided
            switch (this.attribute.kind) {
                case 'string':
                    this.initialAttribute = new EditableStringAttribute(id);
                    break;
                case 'number':
                    this.initialAttribute = new EditableNumberAttribute(id);
                    break;
                case 'boolean':
                    this.initialAttribute = new EditableBooleanAttribute(id);
                    break;
                case 'url':
                    this.initialAttribute = new EditableUrlAttribute(id);
                    break;
                case 'email':
                    this.initialAttribute = new EditableEMailAttribute(id);
                    break;
                case 'time':
                    this.initialAttribute = new EditableTimeAttribute(id);
                    break;
                case 'date':
                    this.initialAttribute = new EditableDateAttribute(id);
                    break;
                case 'date-time':
                    this.initialAttribute = new EditableDateTimeAttribute(id);
                    break;
                case 'foreign':
                    this.initialAttribute = new EditableForeignAttribute(
                        this.attribute.kindOptions.foreign.tableId,
                        false,
                        undefined,
                        id
                    );
                    break;
                case 'files':
                    this.initialAttribute = new EditableFilesAttribute(id);
                    break;
                default:
                    errors.error({
                        message: `There is no attribute-kind: ${
                            (this.attribute as Attribute).kind
                        }`,
                    });
            }
        }
        // Create correct form depending on attribute.kind
        if (!this.kindOptionsForm) {
            const { options, numberOfNonValidatorOptions } =
                this.attributeOptionsService.getOptions(
                    this.initialAttribute,
                    this.attribute
                );
            this.numberOfNonValidatorOptions = numberOfNonValidatorOptions;
            for (const option of options) {
                // See https://github.com/ReactiveX/rxjs/issues/3388
                (option.control.value$ as Observable<any>)
                    .pipe(
                        // Skip the first emit, because it is already the value of the attribute
                        skip(1),
                        takeUntil(this.destroyed)
                    )
                    .subscribe((value) => {
                        this.update(value, option.keys as any);
                        this.changeDetectorRef.markForCheck();
                    });
                this.controlNameKeysDict = {
                    ...this.controlNameKeysDict,
                    [option.control.name]: option.keys,
                };
            }
            this.kindOptionsForm = new Form(
                options.map((option) => option.control)
            );
            this.attributeState.addChild(
                'attributeOptionsState',
                this.kindOptionsForm,
                true
            );
        } else if (changes.attribute || changes.initialAttribute) {
            // Update the values
            for (const control of this.kindOptionsForm.controls) {
                const keys = this.controlNameKeysDict[control.name]!;
                // Set initialValue
                control.setInitialValue(
                    this.attributeOptionsService.getAttributeValue(
                        this.initialAttribute,
                        keys
                    ) as never
                );
                // Set currentValue
                (control as InputControl<any>).setValue(
                    this.attributeOptionsService.getAttributeValue(
                        this.attribute,
                        keys
                    )
                );
            }
        }
    }

    /**
     * sets the value in the attribute of the property keys and emits the new attribute
     * @param value
     * @param keys an array of all keys leading to the property
     */
    public update<
        A extends EditableAttribute = EditableAttribute,
        K1 extends keyof A = keyof A
    >(value: A[K1], keys: Readonly<[K1]>): void;
    public update<
        A extends EditableAttribute = EditableAttribute,
        K1 extends keyof A = keyof A,
        K2 extends keyof A[K1] = keyof A[K1]
    >(value: A[K1][K2], keys: Readonly<[K1, K2]>): void;
    public update<
        A extends EditableAttribute = EditableAttribute,
        K1 extends keyof A = keyof A,
        K2 extends keyof A[K1] = keyof A[K1],
        K3 extends keyof A[K1][K2] = keyof A[K1][K2]
    >(value: A[K1][K2][K3], keys: Readonly<[K1, K2, K3]>): void;
    public update(value: any, keys: Readonly<string[]>) {
        this.attribute = setProperty(
            this.attribute as any,
            value,
            keys as [string]
        );
        this.attributeChange.emit(this.attribute);
    }

    /**
     * resets the current form
     */
    public reset() {
        this.kindOptionsForm!.reset();
        errors.assert(this.attribute.kind === this.initialAttribute.kind, {
            status: 'error',
            message: `attribute and initialAttribute should be of the same kind`,
        });
        if (
            this.attribute.kind === 'foreign' &&
            this.initialAttribute.kind === 'foreign'
        ) {
            this.attribute.kindOptions.intermediateAttributes =
                cloneDeepWritable(
                    this.initialAttribute.kindOptions.intermediateAttributes
                );
        }
        this.attributeState.removeNotUpToDateChildren();
    }

    ngOnDestroy() {
        this.attributeState.upToDate = false;
        this.destroyed.next(undefined);
    }
}
