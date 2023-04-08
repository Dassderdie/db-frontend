import type { OnChanges, OnDestroy } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { TableView } from '@cache-server/api/roles/table-view';
import type { Attribute } from '@cache-server/api/tables/attribute';
import type { UUID } from '@cache-server/api/uuid';
import { Version } from '@cache-server/api/versions/version';
import { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { Form } from '@shared/inputs/form';
import type { CustomInput } from '@shared/inputs/input/input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { AttributeInputsService } from '@tables/core/attribute-inputs.service';
import { GetCurrentValuePipe } from '@tables/shared/pipes/get-current-value.pipe';
import { isEmpty, isEqual } from 'lodash-es';
import type { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-attribute-inputs',
    templateUrl: './attribute-inputs.component.html',
    styleUrls: ['./attribute-inputs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * a form generated from the given attributes
 * (indirectly recursive for the intermediate-attributes of foreign-attributes)
 */
export class AttributeInputsComponent
    extends Destroyed
    implements OnChanges, OnDestroy
{
    /**
     * has to be specified if there is no version created yet/a new version should be created
     * - the changed status will not be shown if only the ids are specified
     * - the special treatment for autoincrement attributes will be applied
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
     * the version whose values should be changed
     * the changed status will only be shown if the initialVersion is specified
     */
    @Input() initialVersion?: Version;
    /**
     * the attributes for which inputs should be generated
     */
    @Input() attributes!: ReadonlyArray<Attribute>;
    /**
     * The TableView for this table (if available)
     */
    @Input() tableView?: TableView;
    /**
     * the state of the parent component
     */
    @Input() parentState!: State;
    /**
     * the values that are different from the values of the initialVersion
     */
    @Input() changedValues?: InputsValues;
    /**
     * a unique id for this components state
     */
    @Input() id = 'entries';
    /**
     * whether the first input should be focused on init
     */
    @Input() autofocus = false;
    /**
     * wether all inputs should be disabled
     */
    @Input() disabled = false;
    /**
     * Emits the changedValues always when they change
     */
    @Output() readonly valuesChange = new EventEmitter<InputsValues>();

    public form?: Form<readonly CustomInput[]>;
    public inputsState!: State;
    public readonly displayedAttributes: {
        normal: Attribute[];
        concealed: Attribute[];
        hidden: Attribute[];
    } = {
        normal: [],
        concealed: [],
        hidden: [],
    };
    /**
     * Concealed Attributes are those who are not shown by default because they are not in the tableView.
     */
    public showConcealedAttributes = false;
    /**
     * Whether hidden inputs should be shown
     */
    public showHiddenAttributes = false;
    /**
     * the attributeId of the attribute that should be auto-focused (if autofocus is true)
     */
    public autofocusId?: UUID;
    public get projectId(): UUID {
        return this.initialVersion
            ? this.initialVersion.projectId
            : this.ids!.projectId;
    }

    public get tableId(): UUID {
        return this.initialVersion
            ? this.initialVersion.tableId
            : this.ids!.tableId;
    }

    constructor(
        private readonly attributesInputsService: AttributeInputsService,
        private readonly getCurrentValuePipe: GetCurrentValuePipe,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            errors.assert(!this.parentState.children[this.id], {
                status: 'logError',
                message: 'the state has not been destroyed correctly.',
            });
            this.inputsState = new State(
                undefined,
                (changedChildren) =>
                    changedChildren ||
                    // simpler than using extra states with "upTpDate = false" like in the tables-editor
                    // Downside is that the invalid state isn't represented correctly
                    // -> less of a problem because hidden && concealed attributes are not toggled very often
                    !!(this.changedValues && !isEmpty(this.changedValues))
            );
            this.parentState.addChild(this.id, this.inputsState, true);
        }
        if (!this.changedValues) {
            // Reset values
            this.changedValues = {};
        }
        if (
            changes.attributes ||
            changes.tableView ||
            changes.showHiddenAttributes
        ) {
            this.generateDisplayedAttributes();
        }
        if (
            (changes.attributes &&
                !isEqual(this.attributes, changes.attributes.previousValue)) ||
            !this.form
        ) {
            this.generateForm();
        } else if (changes.initialVersion || changes.changedValues) {
            // Update values in controls
            for (const control of this.form.controls) {
                // set the initialValue
                if (changes.initialVersion) {
                    control.setInitialValue(
                        this.getInitialValue(control.name) as never
                    );
                }
                // Set correct current value
                if (changes.changedValues) {
                    control.setValue(
                        this.getCurrentValuePipe.transform(
                            this.getInitialValue(control.name),
                            this.changedValues[control.name]
                        ) as never
                    );
                }
            }
        }
        if (changes.changedValues) {
            this.inputsState.updateState(false, true);
        }
        if (changes.disabled) {
            this.form!.setDisabled(this.disabled);
        }
    }

    private generateDisplayedAttributes() {
        this.displayedAttributes.normal = [];
        this.displayedAttributes.concealed = [];
        this.displayedAttributes.hidden = [];
        if (this.tableView) {
            this.displayedAttributes.normal = this.tableView.orderedAttributeIds
                .map((id) => this.attributes.find((attr) => attr.id === id))
                // the orderedAttributeIds are not updated after an attribute got deleted
                .filter((attr) => !!attr) as Attribute[];
            this.displayedAttributes.concealed = this.attributes.filter(
                (attr) => !attr.hidden && !this.inDisplayedAttributes(attr)
            );
        } else {
            this.displayedAttributes.normal = this.attributes.filter(
                (attr) => !attr.hidden
            );
        }
        this.displayedAttributes.hidden = this.attributes.filter(
            (attr) => attr.hidden && !this.inDisplayedAttributes(attr)
        );
        this.generateAutofocusId();
    }

    private inDisplayedAttributes(attr: Attribute) {
        return this.displayedAttributes.normal.find(
            (attr2) => attr.id === attr2.id
        );
    }

    private formSubscription?: Subscription;

    private generateForm() {
        this.formSubscription?.unsubscribe();
        // Create form
        const controls: CustomInput[] = [];
        for (const attribute of this.attributes) {
            if (attribute.kind !== 'foreign' && attribute.kind !== 'files') {
                const newInput = this.attributesInputsService.createInput(
                    this.projectId,
                    this.tableId,
                    attribute,
                    this.getInitialValue(attribute.id),
                    !!this.initialVersion,
                    this.initialVersion
                        ? this.initialVersion.entryId
                        : undefined,
                    // The attribute is no ForeignAttribute, therefore the value is no ForeignValue
                    this.changedValues![
                        attribute.id
                    ] as unknown as Version['values'][0]
                );
                if (newInput) {
                    controls.push(newInput);
                } else {
                    errors.error({ message: 'Not able to create input' });
                }
            }
        }
        this.form = new Form(controls);
        this.formSubscription = this.form.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ key, value }) => {
                if (!this.changedValues) {
                    this.changedValues = {};
                    errors.error({ message: 'changedValues were undefined' });
                }
                // If the current value has changed (if initialVersion are not defined the default value is null)
                if (value !== this.getInitialValue(key)) {
                    this.changedValues[key] = value;
                } else {
                    // Delete because this attribute is not changed anymore
                    delete this.changedValues[key];
                }
                this.emitChangedValues();
                this.changeDetectorRef.markForCheck();
            });
        this.inputsState.addChild('entries', this.form, true);
    }

    private generateAutofocusId(): UUID | undefined {
        this.autofocusId = undefined;
        if (!this.autofocus) {
            return;
        }
        for (const attribute of [
            ...this.displayedAttributes.normal,
            ...this.displayedAttributes.concealed,
            ...this.displayedAttributes.hidden,
        ]) {
            if (
                attribute &&
                // attributes that cannot get autofocused
                attribute.kind !== 'foreign' &&
                attribute.kind !== 'files' &&
                // if the attribute has default-increment no autofocus should be there
                (attribute.kind !== 'string' ||
                    typeof attribute.kindOptions.defaultIncrementPrefix !==
                        'string') &&
                (attribute.kind !== 'number' ||
                    !attribute.kindOptions.defaultIncrement)
            ) {
                return attribute.id;
            }
        }
        return undefined;
    }

    public updateValue(attribute: Attribute, value: InputsValues[string]) {
        if (value === undefined) {
            // because isEmpty({ a: undefined }) === false
            delete this.changedValues![attribute.id];
        } else {
            this.changedValues![attribute.id] = value;
        }
        this.emitChangedValues();
    }

    /**
     * returns always the correct initialValue with undefined replaced with null
     * @returns the correct initialValue of the specified attribute
     */
    private getInitialValue(attributeId: UUID) {
        if (!this.initialVersion) {
            return null;
        }
        const initialValue = this.initialVersion.values[attributeId];
        return initialValue !== undefined ? initialValue : null;
    }

    /**
     * emits the changed Values
     */
    public emitChangedValues() {
        // Renew reference
        this.changedValues = { ...this.changedValues };
        this.inputsState.updateState(false, true);
        this.valuesChange.emit(this.changedValues);
    }

    ngOnDestroy() {
        this.inputsState.destroy();
        this.parentState.removeNotUpToDateChildren();
        this.destroyed.next(undefined);
    }
}
