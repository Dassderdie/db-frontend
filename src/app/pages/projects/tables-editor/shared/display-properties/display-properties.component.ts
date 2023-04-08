import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
    ChangeDetectorRef,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Language, Languages } from '@core/utility/i18n/languages';
import { languages } from '@core/utility/i18n/languages';
import { Form } from '@shared/inputs/form';
import type { CustomInput } from '@shared/inputs/input/input';
import { makeCustom } from '@shared/inputs/input/input';
import { MarkdownInput } from '@shared/inputs/markdown-input/markdown-input';
import { CustomValidators } from '@shared/inputs/shared/validation/custom-validators';
import { StringInput } from '@shared/inputs/string-input/string-input';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import type { DeepReadonly } from '@shared/utility/types/deep-readonly';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { DeepWritable } from '@shared/utility/types/writable';
import { isEmpty } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { DisplayProperties } from './display-properties';

@Component({
    selector: 'app-display-properties',
    templateUrl: './display-properties.component.html',
    styleUrls: ['./display-properties.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPropertiesComponent
    extends Destroyed
    implements OnChanges, OnDestroy, OnInit
{
    @Input() initialDisplayProperties!: DisplayProperties;
    @Input() displayProperties!: DeepWritable<DisplayProperties>;
    @Input() parentState!: State;
    @Output()
    readonly displayPropertiesChange = new EventEmitter<DisplayProperties>();

    public display: DeepReadonly<{ [key: string]: boolean }> = {};

    // To access languages in template
    public readonly languages = languages;
    public forms: {
        readonly [key: string]: DisplayPropertiesForm;
    } = {};
    public displayPropertiesState = new State();

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        // Add the validators onInit to always update the correct
        this.displayPropertiesState.setValidators([
            (value) => {
                // Check if at least one language is set
                // Use values in the form instead of the displayProperties object to do it synchronously
                if (
                    Object.values(this.forms).some(
                        (form) => form.controls[0].value
                    )
                ) {
                    return null;
                }
                return {
                    minimumLanguages: {
                        translationKey: _(
                            'pages.tablesEditor.displayProperties.minimum-languages'
                        ),
                    },
                };
            },
        ]);
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            const id = 'displayProperties';
            if (this.parentState.children[id]) {
                this.displayPropertiesState = this.parentState.children[
                    id
                ] as State;
                this.displayPropertiesState.upToDate = true;
            } else {
                this.parentState.addChild(id, this.displayPropertiesState);
            }
        }
        if (isEmpty(this.forms)) {
            // Initialise controls
            for (const language of languages) {
                const form: DisplayPropertiesForm = new Form([
                    makeCustom(
                        new StringInput(
                            `displayNameSing${language.id}`,
                            this.initialDisplayProperties.displayNames[
                                language.id
                            ]!.singular,
                            {
                                validators: [CustomValidators.maxLength(30)],
                                firstCurrentValue:
                                    this.displayProperties.displayNames[
                                        language.id
                                    ]!.singular,
                            }
                        ),
                        {
                            leftAddons: [
                                {
                                    translateKey: _(
                                        'pages.tablesEditor.displayProperties.singular'
                                    ),
                                    required: true,
                                },
                            ],
                        }
                    ),
                    makeCustom(
                        new StringInput(
                            `displayNamePlural${language.id}`,
                            this.initialDisplayProperties.displayNames[
                                language.id
                            ]!.plural as string | null,
                            {
                                validators: [CustomValidators.maxLength(30)],
                                firstCurrentValue:
                                    this.displayProperties.displayNames[
                                        language.id
                                    ]!.plural,
                            }
                        ),
                        {
                            leftAddons: [
                                {
                                    translateKey: _(
                                        'pages.tablesEditor.displayProperties.plural'
                                    ),
                                },
                            ],
                        }
                    ),
                    new MarkdownInput(
                        `description${language.id}`,
                        this.initialDisplayProperties.descriptions[
                            language.id
                        ]!,
                        {
                            translateKey: _(
                                'pages.tablesEditor.displayProperties.description'
                            ),
                        },
                        {
                            firstCurrentValue:
                                this.displayProperties.descriptions[
                                    language.id
                                ],
                        }
                    ),
                ]);
                this.forms = {
                    ...this.forms,
                    [language.id]: form,
                };
                this.displayPropertiesState.addChild(language.id, form, true);
                form.value$
                    .pipe(takeUntil(this.destroyed))
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    .subscribe(({ key, value }) => {
                        const langId = key.slice(
                            -3
                        ) as keyof Languages<unknown>;
                        switch (key.slice(0, -3)) {
                            case 'displayNameSing':
                                this.displayProperties.displayNames[
                                    langId
                                ]!.singular = value;
                                break;
                            case 'displayNamePlural':
                                this.displayProperties.displayNames[
                                    langId
                                ]!.plural = value;
                                break;
                            case 'description':
                                this.displayProperties.descriptions[langId] =
                                    value;
                                break;
                            default:
                                errors.error({
                                    message: 'Unknown displayProperty-input!',
                                });
                                break;
                        }
                        this.displayPropertiesChange.emit(
                            this.displayProperties
                        );
                        this.changeDetectorRef.markForCheck();
                    });
            }
        } else if (
            changes.displayProperties ||
            changes.initialDisplayProperties
        ) {
            // Update currentValues & initialValues
            for (const lang of languages) {
                const controls = this.forms[lang.id]!.controls;
                controls[0].setInitialValue(
                    this.initialDisplayProperties.displayNames[lang.id]!
                        .singular
                );
                controls[0].setValue(
                    this.displayProperties.displayNames[lang.id]!.singular
                );
                controls[1].setInitialValue(
                    this.initialDisplayProperties.displayNames[lang.id]!
                        .plural ?? null
                );
                controls[1].setValue(
                    this.displayProperties.displayNames[lang.id]!.plural ?? null
                );
                controls[2].setInitialValue(
                    this.initialDisplayProperties.descriptions[lang.id]!
                );
                controls[2].setValue(
                    this.displayProperties.descriptions[lang.id]!
                );
            }
        }
    }

    /**
     * toggles the opening state of a language property
     * @param language the language which should be toggled
     */
    public toggleDisplayLanguage(language: Language['id']) {
        this.display = {
            ...this.display,
            [language]: !this.display[language],
        };
    }

    ngOnDestroy() {
        this.displayPropertiesState.upToDate = false;
        this.destroyed.next(undefined);
    }
}

type DisplayPropertiesForm = Form<
    [
        CustomInput & StringInput, // NameSing
        CustomInput & StringInput, // NamePlur
        CustomInput & MarkdownInput // Description
    ]
>;
