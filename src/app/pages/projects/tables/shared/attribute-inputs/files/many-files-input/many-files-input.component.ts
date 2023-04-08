import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { getFileExtension } from '@cache-server/api/blobs/get-file-extension';
import { FilesAttribute } from '@cache-server/api/tables/attribute';
import { UUID } from '@cache-server/api/uuid';
import type { FilesValue } from '@cache-server/api/versions/version';
import { BlobsService } from '@core/cache-client/api/blobs/blobs.service';
import { ConfirmationModalService } from '@core/utility/confirmation-modal/confirmation-modal.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { State } from '@shared/utility/classes/state/state';
import { saveBlob } from '@shared/utility/functions/save-blob';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { previewFilesModal } from '@shared/versions/display-version/files/preview/preview-modal/preview-files-modal';
import { sortFileKeys } from '@shared/versions/display-version/files/sort-file.keys';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FilesInputValues } from '../files-input-values';
import { FilesInputValuesProcessor } from '../files-input-values-processor';

@Component({
    selector: 'app-many-files-input',
    templateUrl: './many-files-input.component.html',
    styleUrls: ['./many-files-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManyFilesInputComponent
    extends Destroyed
    implements OnInit, OnChanges, OnDestroy
{
    /**
     * the latest version of the entry that should be edited
     */
    @Input() initialValue?: FilesValue | null;
    /**
     * The current projectId (for the creatorId)
     */
    @Input() projectId!: UUID;
    /**
     * the files-attribute whose values this input should alter
     */
    @Input() attribute!: FilesAttribute;
    /**
     * the changed values of the relations
     */
    @Input() value?: FilesInputValues;
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
    @Output() readonly valueChange = new EventEmitter<FilesInputValues>();

    /**
     * The state of this component
     */
    public readonly inputState = new State<unknown, State>();

    readonly destroyed = new Subject();

    public drop = false;
    public acceptedExtensions: string | null = '';
    public displayKeys: {
        files: string[];
        newFiles: string[];
    } = {
        files: [],
        newFiles: [],
    };
    public sortObject: {
        newFiles: {
            key: 'name' | 'size';
            order: -1 | 1;
        };
        files: {
            key: 'name' | 'size';
            order: -1 | 1;
        };
    } = {
        newFiles: {
            key: 'name',
            order: 1,
        },
        files: {
            key: 'name',
            order: 1,
        },
    };

    /**
     * The user would always loose focus, when the rename would be applied directly/
     * when renaming 'a (1).pdf' to 'a.pdf' (when 'a.pdf' already exists) the rename would yield 'a (1).pdf'
     * -> the fileName in the template stays the same -> the value of the input-field cannot be forced to
     * the fileName again (because it doesn't change)
     *
     * It is guaranteed that there is not more than one value in the dictionary
     * A dictionary where
     * key: the currentFileName this.value.(newFiles or files)
     */
    public pendingRenames: {
        newFiles: {
            [currentFileName: string]: PendingRename;
        };
        files: {
            [currentFileName: string]: PendingRename;
        };
    } = {
        newFiles: {},
        files: {},
    };

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly blobsService: BlobsService,
        private readonly confirmationModalService: ConfirmationModalService
    ) {
        super();
    }

    ngOnInit() {
        this.inputState.setValidators([
            (value) =>
                !this.value || FilesInputValuesProcessor.hasErrors(this.value)
                    ? {
                          fileHasError: {
                              hidden: true,
                          },
                      }
                    : null,
            (value) => {
                if (!this.value) {
                    return null;
                }
                const numberOfFiles =
                    FilesInputValuesProcessor.getNumberOfFiles(this.value);
                return typeof this.attribute.kindOptions.minimumFileAmount ===
                    'number' &&
                    // no files do not violate the minimumFileAmount - you have to set required too
                    numberOfFiles &&
                    numberOfFiles < this.attribute.kindOptions.minimumFileAmount
                    ? {
                          minimumFileAmount: {
                              translationKey: _('custom-forms.files.min-error'),
                              min: this.attribute.kindOptions.minimumFileAmount,
                              difference:
                                  this.attribute.kindOptions.minimumFileAmount -
                                  numberOfFiles,
                          },
                      }
                    : null;
            },
            (value) => {
                if (!this.value) {
                    return null;
                }
                const numberOfFiles =
                    FilesInputValuesProcessor.getNumberOfFiles(this.value);
                return typeof this.attribute.kindOptions.maximumFileAmount ===
                    'number' &&
                    numberOfFiles > this.attribute.kindOptions.maximumFileAmount
                    ? {
                          maximumFileAmount: {
                              translationKey: _('custom-forms.files.max-error'),
                              max: this.attribute.kindOptions.maximumFileAmount,
                              difference:
                                  numberOfFiles -
                                  this.attribute.kindOptions.maximumFileAmount,
                          },
                      }
                    : null;
            },
            (value) => {
                if (!this.value) {
                    return null;
                }
                const numberOfFiles =
                    FilesInputValuesProcessor.getNumberOfFiles(this.value);
                return this.attribute.required && numberOfFiles < 1
                    ? {
                          required: {
                              translationKey: _('validators.error.required'),
                          },
                      }
                    : null;
            },
        ]);

        this.inputState.updateChangedFunction(
            (changedChildren) =>
                changedChildren ||
                !!(
                    this.value &&
                    FilesInputValuesProcessor.hasChanges(this.value)
                )
        );
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.parentState) {
            this.parentState.addChild(
                this.attribute.id,
                this.inputState,
                false
            );
        }
        if (changes.attribute) {
            // TODO: if other separator: .join(';')
            this.acceptedExtensions =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                this.attribute.kindOptions.allowedFileExtensions?.toString() ||
                null;
            if (this.value) {
                FilesInputValuesProcessor.updateAllErrors(
                    this.value,
                    this.attribute
                );
            }
        }
        if (changes.value) {
            // reset all pendingRenames
            this.pendingRenames = {
                newFiles: {},
                files: {},
            };
            if (!this.value) {
                this.value = new FilesInputValues();
                FilesInputValuesProcessor.updateAllErrors(
                    this.value,
                    this.attribute
                );
                FilesInputValuesProcessor.setInitialFiles(
                    this.value,
                    this.initialValue,
                    this.attribute
                );
            }
            this.inputState.updateState(true, true);
            this.updateDisplayKeys();
        } else if (changes.initialValue) {
            if (!this.value) {
                errors.error({
                    message: 'this.value must be assigned at this point!',
                });
            } else {
                FilesInputValuesProcessor.setInitialFiles(
                    this.value,
                    this.initialValue,
                    this.attribute
                );
            }
            this.updateDisplayKeys();
        }
    }

    /**
     * Deletes a currently present file
     */
    public deletePresentFile(fileName: string) {
        FilesInputValuesProcessor.deletePresentFile(
            this.value!,
            fileName,
            this.attribute
        );
        this.updateDisplayKeys();
        this.emitValue();
    }

    public renamePresentFile(fileName: string, newName: string) {
        delete this.pendingRenames.files[fileName];
        FilesInputValuesProcessor.renamePresentFile(
            this.value!,
            fileName,
            newName,
            this.attribute
        );
        this.updateDisplayKeys();
        this.emitValue();
    }

    public restorePresentFile(fileName: string) {
        FilesInputValuesProcessor.restorePresentFile(
            this.value!,
            fileName,
            this.attribute
        );
        this.updateDisplayKeys();
        this.emitValue();
    }

    private addNewFile(name: string, blob: Blob) {
        FilesInputValuesProcessor.addNewFile(
            this.value!,
            name,
            blob,
            this.attribute
        );
        this.updateDisplayKeys();
        this.emitValue();
    }

    public deleteNewFile(name: string) {
        FilesInputValuesProcessor.deleteNewFile(this.value!, name);
        this.updateDisplayKeys();
        this.emitValue();
    }

    public updateRenameValue(
        kind: 'files' | 'newFiles',
        fileName: string,
        newName: string
    ) {
        if (this.getCurrentFileName(kind, fileName) === newName) {
            delete this.pendingRenames[kind][fileName];
        } else {
            this.pendingRenames[kind][fileName] = { newName };
        }
    }

    public async performRenames(kind: 'files' | 'newFiles') {
        for (const [fileName, pendingRename] of Object.entries(
            this.pendingRenames[kind]
        )) {
            if (pendingRename.confirmationPending) {
                continue;
            }
            const newName = pendingRename.newName;
            const oldExtension = getFileExtension(
                this.getCurrentFileName(kind, fileName)
            );
            const newExtension = getFileExtension(newName);
            if (oldExtension !== newExtension) {
                // set semaphore
                pendingRename.confirmationPending = true;
                // eslint-disable-next-line no-await-in-loop
                const permission = await this.confirmationModalService.confirm({
                    title: _(
                        'pages.entries.files-input.confirm-extension-change.title'
                    ),
                    description: _(
                        'pages.entries.files-input.confirm-extension-change.description'
                    ),
                    descriptionsParams: {
                        oldExtension: oldExtension ?? '',
                        newExtension: newExtension ?? '',
                    },
                    btnOkText: _(
                        'pages.entries.files-input.confirm-extension-change.btn-ok-text'
                    ),
                    kind: 'warning',
                });
                if (!permission) {
                    delete this.pendingRenames[kind][fileName];
                    continue;
                }
            }
            this[kind === 'files' ? 'renamePresentFile' : 'renameNewFile'](
                fileName,
                newName
            );
        }
    }

    public toggleSortBy(kind: 'files' | 'newFiles', key: 'name' | 'size') {
        const sortingObj = this.sortObject[kind];
        sortingObj.order =
            sortingObj.key === key && sortingObj.order === -1 ? 1 : -1;
        sortingObj.key = key as any;
        this.sortFileKeys(kind);
    }

    private renameNewFile(oldName: string, newName: string) {
        delete this.pendingRenames.newFiles[oldName];
        FilesInputValuesProcessor.renameNewFile(
            this.value!,
            oldName,
            newName,
            this.attribute
        );
        this.updateDisplayKeys();
        this.emitValue();
    }

    private getCurrentFileName(kind: 'files' | 'newFiles', fileName: string) {
        if (kind === 'newFiles') {
            return fileName;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return this.value?.files[fileName]?.changedFileName || fileName;
    }

    public isValidDrop(event: DragEvent) {
        if (event.dataTransfer?.files) {
            this.drop = true;
            event.preventDefault();
        }
    }

    public dragLeave() {
        this.drop = false;
    }

    public addFiles(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            const file: (Blob & { name: string; lastModified: number }) | null =
                files.item(i);
            if (file) {
                // TODO: convert file to blob
                this.addNewFile(file.name, file);
            }
        }
    }

    public filesDropped(event: DragEvent) {
        if (event.dataTransfer?.files) {
            event.preventDefault();
            this.addFiles(event.dataTransfer.files);
        }
        this.drop = false;
    }

    public previewFile(file: Blob | UUID, fileName: string) {
        previewFilesModal(file, fileName, this.bsModalService);
    }

    public downloadFile(file: Blob | UUID, fileName: string) {
        if (typeof file === 'string') {
            this.blobsService
                .getBlob(file, fileName, true)
                .then((blob) => saveBlob(blob, fileName));
        } else {
            saveBlob(file, fileName);
        }
    }

    /**
     * Updates the keys used to display the files in the table, respecting the sortObject
     */
    private updateDisplayKeys() {
        this.displayKeys = {
            files: Object.keys(this.value?.files ?? {}),
            newFiles: Object.keys(this.value?.newFiles ?? {}),
        };
        this.sortFileKeys('newFiles');
        this.sortFileKeys('files');
    }

    private sortFileKeys(kind: 'files' | 'newFiles') {
        if (!this.value) {
            errors.error({
                message: 'Value must be defined',
            });
            return;
        }
        this.displayKeys[kind] = sortFileKeys(
            this.displayKeys[kind],
            this.sortObject[kind].key,
            this.sortObject[kind].order,
            this.value[kind],
            (fileName) => this.getCurrentFileName(kind, fileName)
        );
    }

    private emitValue() {
        this.inputState.updateState(true, true);
        if (this.value && FilesInputValuesProcessor.hasChanges(this.value)) {
            this.value = { ...this.value };
            this.valueChange.emit(this.value);
        } else {
            // the value is then newly created -> should be same value as now
            this.valueChange.emit(undefined);
        }
    }

    ngOnDestroy() {
        this.inputState.destroy();
        this.parentState.removeNotUpToDateChildren();
        this.destroyed.next(undefined);
    }
}

interface PendingRename {
    /**
     * the name to which the fileName should be changed (after the input is blurred/keydown.enter)
     */
    newName: string;
    /**
     * wether the confirmation for changing this files name is currently pending
     */
    confirmationPending?: true;
}
