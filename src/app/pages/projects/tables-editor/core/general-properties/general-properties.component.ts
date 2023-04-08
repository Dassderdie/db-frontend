import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    Output,
    ChangeDetectorRef,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Form } from '@shared/inputs/form';
import { Option } from '@shared/inputs/select-input/option';
import { SelectInput } from '@shared/inputs/select-input/select-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import type { DisplayProperties } from '@tables-editor/shared/display-properties/display-properties';
import { takeUntil } from 'rxjs/operators';
import { GeneralProperties } from './general-properties';

@Component({
    selector: 'app-general-properties',
    templateUrl: './general-properties.component.html',
    styleUrls: ['./general-properties.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralPropertiesComponent
    extends Destroyed
    implements OnChanges, OnInit, OnDestroy
{
    @Input() initialGeneralProperties!: GeneralProperties;
    @Input() generalProperties!: GeneralProperties;
    @Input() parentState!: State;
    /**
     * wether the generaProperties is not collapsed and the inputs should be displayed
     */
    @Input() open = false;
    /**
     * emits when the generaProperties should be closed (false) or opened (true)
     */
    @Output() readonly openChange = new EventEmitter<boolean>();
    /**
     * emits always when the generalProperties change the new generalProperties
     */
    @Output()
    readonly generalPropertiesChange = new EventEmitter<GeneralProperties>();
    @Output() readonly deleteTable = new EventEmitter();

    public generalOptionsState = new State();
    public readonly generalOptionsForm = new Form([
        new SelectInput('allowAnonymousVersionCreation', true, [
            new Option(null, {
                text: _('pages.tablesEditor.projectDefault'),
                kind: 'translate',
                icons: ['null'],
            }),
            new Option(
                true,
                {
                    text: _('boolean.true'),
                    kind: 'translate',
                    icons: ['true'],
                },
                false
            ),
            new Option(
                false,
                {
                    text: _('boolean.false'),
                    kind: 'translate',
                    icons: ['false'],
                },
                false
            ),
        ]),
    ]);

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.generalOptionsState.addChild(
            'generalOptions',
            this.generalOptionsForm,
            true
        );
        this.generalOptionsForm.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ key, value }) => {
                this.generalProperties[key as 'allowAnonymousVersionCreation'] =
                    value;
                this.generalPropertiesChange.emit(this.generalProperties);
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            const id = 'generalProperties';
            if (this.parentState.children[id]) {
                this.generalOptionsState = this.parentState.children[
                    id
                ] as State;
                this.generalOptionsState.upToDate = true;
            } else {
                this.parentState.addChild(id, this.generalOptionsState);
            }
            this.generalOptionsState.newCreated = this.parentState.newCreated;
            if (this.generalOptionsState.newCreated) {
                this.open = true;
            }
        }
        if (changes.generalProperties) {
            this.generalOptionsForm.controls[0]!.setValue(
                this.generalProperties.allowAnonymousVersionCreation
            );
        }
        if (changes.initialGeneralProperties) {
            this.generalOptionsForm.controls[0]!.setInitialValue(
                this.initialGeneralProperties.allowAnonymousVersionCreation
            );
        }
    }

    public updateDisplayProperties(newValue: DisplayProperties) {
        // Update value and trigger changeDetection in pipes
        this.generalProperties.displayNames = { ...newValue.displayNames };
        this.generalProperties.descriptions = { ...newValue.descriptions };
        this.generalPropertiesChange.emit(this.generalProperties);
    }

    public reset() {
        this.generalOptionsForm.reset();
        this.generalOptionsState.removeNotUpToDateChildren();
    }

    ngOnDestroy() {
        this.generalOptionsState.upToDate = false;
        this.destroyed.next(undefined);
    }
}
