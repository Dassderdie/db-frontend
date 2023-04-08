import { Injectable } from '@angular/core';
import type {
    EditFiles,
    EditValues,
} from '@cache-server/api/edit-entries/edit-values';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { FilesInputValuesProcessor } from '@tables/shared/attribute-inputs/files/files-input-values-processor';
import type { NewFile } from '@tables/shared/attribute-inputs/files/new-file';
import type {
    NewForeignEntry,
    EditForeignEntry,
} from '@tables/shared/attribute-inputs/foreign/foreign-input-value';
import { isEmpty } from 'lodash-es';
import { CacheClientService } from '../../cache-client.service';
import type { InputsValues } from './inputs-values';

@Injectable({
    providedIn: 'root',
})
export class EditEntriesService {
    constructor(private readonly cacheClientService: CacheClientService) {}

    /**
     * processes inputsValues and creates/edits/deletes therefore entries and relations
     * @param projectId
     * @param tableId
     * @param inputValues the values of the inputs that should be transformed to entries/versions
     * @param anonymous
     * @param entryId the entryId of the entry that should initially be edited (undefined if a new one should be created)
     * @returns a promise that resolves to the initially created version,
     * but only after all necessary requests have been send and the responses received
     */
    public async processInputsValues(
        projectId: UUID,
        tableId: UUID,
        inputValues: InputsValues,
        anonymous: boolean,
        entryId?: UUID
    ): Promise<Version> {
        // Whether a foreign relation has changed
        const foreignRelationChanged = Object.values(inputValues).some(
            (value) => typeof value === 'object' && value?.type === 'foreign'
        );
        let initialRequest: Promise<Version>;
        if (entryId) {
            // Async to generate the updateId
            initialRequest = this.putEntry(
                projectId,
                tableId,
                entryId,
                await this.cleanValues(inputValues, true),
                anonymous,
                foreignRelationChanged || null
            );
        } else {
            // Async due to updateId and entryId
            initialRequest = this.createEntry(
                projectId,
                tableId,
                await this.cleanValues(inputValues, false),
                anonymous,
                foreignRelationChanged || null
            );
        }
        return initialRequest.then(async (createdVersion) => {
            // Create, update and delete foreign relations
            await this.updateForeignRelations(
                projectId,
                inputValues,
                anonymous,
                createdVersion.updateId!,
                [],
                createdVersion.entryId
            );
            // Emit the initially edited/created version
            return createdVersion;
        });
    }

    /**
     * Creates a new entry
     * @param projectId
     * @param tableId
     * @param values
     * @param updateVersions wether all potentially changed results of searches should be reloaded
     * @returns the new created entry
     */
    public async createEntry(
        projectId: UUID,
        tableId: UUID,
        values: EditValues,
        anonymous: boolean,
        updateId: UUID | true | null,
        updateVersions = true
    ) {
        return this.cacheClientService.handleAction({
            type: 'editEntries',
            action: {
                kind: 'createEntry',
                options: {
                    projectId,
                    tableId,
                    values,
                    anonymous,
                    updateId,
                    updateVersions,
                },
            },
        });
    }

    /**
     * Deletes an entry
     * @param projectId
     * @param tableId
     * @param entryId
     * @param anonymous
     * @param updateId
     * @param updateVersions wether all potentially changed results of searches should be reloaded
     * @param previousValues the values of the entry before deletion (for response validation)
     * @returns the deleted entry
     */
    public async deleteEntry(
        projectId: UUID,
        tableId: UUID,
        entryId: UUID,
        anonymous: boolean,
        updateId: UUID | true | null,
        updateVersions = true,
        previousValues?: Version['values']
    ) {
        return this.cacheClientService.handleAction({
            type: 'editEntries',
            action: {
                kind: 'deleteEntry',
                options: {
                    projectId,
                    tableId,
                    entryId,
                    anonymous,
                    updateId,
                    updateVersions,
                    previousValues,
                },
            },
        });
    }

    /**
     * Updates entry in backend
     * @param projectId
     * @param tableId
     * @param entryId
     * @param values
     * @param updateVersions wether all potentially changed results of searches should be reloaded
     * @returns the edited entry
     */
    public async putEntry(
        projectId: UUID,
        tableId: UUID,
        entryId: UUID,
        values: EditValues,
        anonymous: boolean,
        updateId: UUID | true | null,
        updateVersions = true
    ) {
        return this.cacheClientService.handleAction({
            type: 'editEntries',
            action: {
                kind: 'editEntry',
                options: {
                    projectId,
                    tableId,
                    entryId,
                    values,
                    anonymous,
                    updateId,
                    updateVersions,
                },
            },
        });
    }

    /**
     * @param projectId
     * @param inputValues
     * @param anonymous
     * @param updatedConnectedEntries an array of all connected Entries that have already been updated to
     * show in their history that something has changed
     * @param entryId the entryId of the entry, from which the relation is initiated (in the inputs)
     * @returns a promise that resolves when all promises are resolved
     */
    private async updateForeignRelations(
        projectId: UUID,
        inputValues: InputsValues,
        anonymous: boolean,
        updateId: UUID,
        updatedConnectedEntries: { tableId: UUID; entryId: UUID }[],
        entryId: UUID
    ): Promise<unknown> {
        const foreignActions: Promise<any>[] = [];
        /**
         * an array of all tables/their ids, whose version results must have been reloaded,
         * because they could be incorrect now
         */
        const updateVersionsTables: Set<UUID> = new Set();
        // Add foreign-relations
        for (const inputValue of Object.values(inputValues)) {
            if (
                typeof inputValue !== 'object' ||
                !inputValue ||
                !('type' in inputValue) ||
                inputValue.type !== 'foreign'
            ) {
                continue;
            }
            // Is foreign relation
            // Changed/to be deleted relations
            for (const [intermediateEntryId, foreignEntry] of Object.entries(
                inputValue.changedRelations
            )) {
                if (foreignEntry.delete) {
                    foreignActions.push(
                        this.deleteEntry(
                            projectId,
                            foreignEntry.intermediateTableId,
                            intermediateEntryId,
                            anonymous,
                            updateId,
                            false
                        )
                        // The backend will delete all related entries
                    );
                } else {
                    // Add ids of the connected entries
                    if (!foreignEntry.changedIntermediateValues) {
                        foreignEntry.changedIntermediateValues = {};
                    }
                    // This relation should be updated
                    foreignActions.push(
                        this.cleanValues(
                            foreignEntry.changedIntermediateValues,
                            !!entryId
                        ).then(async (cleanedValues) =>
                            this.putEntry(
                                projectId,
                                foreignEntry.intermediateTableId,
                                intermediateEntryId,
                                cleanedValues,
                                anonymous,
                                updateId,
                                false
                            )
                        )
                    );
                    if (foreignEntry.changedIntermediateValues) {
                        // Deal with all the nested relations at the same time as with the parent,
                        // Because they are independent from each other
                        foreignActions.push(
                            this.updateForeignRelations(
                                projectId,
                                foreignEntry.changedIntermediateValues,
                                anonymous,
                                updateId,
                                updatedConnectedEntries,
                                intermediateEntryId
                            )
                        );
                    }
                }
                this.saveVersionWithUpdateId(
                    projectId,
                    anonymous,
                    updateId,
                    updatedConnectedEntries,
                    updateVersionsTables,
                    foreignActions,
                    foreignEntry
                );
                updateVersionsTables.add(foreignEntry.intermediateTableId);
            }
            // New relations
            for (const newForeignEntry of inputValue.newRelations) {
                if (!newForeignEntry.changedIntermediateValues) {
                    newForeignEntry.changedIntermediateValues = {};
                }
                // This relation should be created
                newForeignEntry.changedIntermediateValues[
                    newForeignEntry.entryAttributeId
                ] = entryId;
                newForeignEntry.changedIntermediateValues[
                    newForeignEntry.foreignEntryAttributeId
                ] = newForeignEntry.foreignEntryId;
                foreignActions.push(
                    this.cleanValues(
                        newForeignEntry.changedIntermediateValues,
                        !!entryId
                    )
                        .then(async (cleanedValues) =>
                            this.createEntry(
                                projectId,
                                newForeignEntry.intermediateTableId,
                                cleanedValues,
                                anonymous,
                                updateId,
                                false
                            )
                        )
                        .then(async (createdIntermediateEntry) => {
                            // Create all nested relations after this version is created to be able to specify the entryId
                            if (newForeignEntry.changedIntermediateValues) {
                                await this.updateForeignRelations(
                                    projectId,
                                    newForeignEntry.changedIntermediateValues,
                                    anonymous,
                                    updateId,
                                    updatedConnectedEntries,
                                    createdIntermediateEntry.entryId
                                );
                            }
                        })
                );
                this.saveVersionWithUpdateId(
                    projectId,
                    anonymous,
                    updateId,
                    updatedConnectedEntries,
                    updateVersionsTables,
                    foreignActions,
                    newForeignEntry
                );
                updateVersionsTables.add(newForeignEntry.intermediateTableId);
            }
        }
        return Promise.all(foreignActions).finally(() => {
            // Reload all tables in updateVersionsTables
            for (const tableId of updateVersionsTables) {
                this.cacheClientService.handleAction({
                    type: 'versions',
                    action: {
                        kind: 'updateVersions',
                        options: {
                            projectId,
                            tableId,
                        },
                    },
                });
            }
        });
    }

    /**
     * creates a new version of the connected entry to see this change in its history
     * @param projectId
     * @param anonymous
     * @param updateId
     * @param updatedConnectedEntries
     * @param actions an array of all actions that should be performed to correctly process the input value of the form
     * @param changedForeignEntry the relation that should be created/changed
     * @returns void but this function performs operations on updateConnectedEntries, updateVersionsTables, actions and changedForeignEntry
     */
    private saveVersionWithUpdateId(
        projectId: UUID,
        anonymous: boolean,
        updateId: UUID,
        updatedConnectedEntries: { tableId: UUID; entryId: UUID }[],
        updateVersionsTables: Set<UUID>,
        actions: Promise<Version>[],
        changedForeignEntry: EditForeignEntry | NewForeignEntry
    ) {
        // If this entry wasn't already updated with this change (multiple foreign relations to the same entry)
        if (
            !updatedConnectedEntries.some(
                (connectedEntry) =>
                    connectedEntry.tableId ===
                        changedForeignEntry.foreignTableId &&
                    connectedEntry.entryId ===
                        changedForeignEntry.foreignEntryId
            )
        ) {
            updatedConnectedEntries.push({
                tableId: changedForeignEntry.foreignTableId,
                entryId: changedForeignEntry.foreignEntryId,
            });
            // Create a new version of the connected entry to see this change in its history
            actions.push(
                this.putEntry(
                    projectId,
                    changedForeignEntry.foreignTableId,
                    changedForeignEntry.foreignEntryId,
                    {},
                    anonymous,
                    updateId,
                    false
                )
            );
            updateVersionsTables.add(changedForeignEntry.foreignTableId);
        }
    }

    /**
     * @param inputValues
     * @param edit wether the request is an edit or the creation of a new entry
     * @returns a copy of the inputValues with all
     * frontend-internal values replaced with api-confirm ones
     */
    private async cleanValues(
        inputValues: InputsValues,
        edit: boolean
    ): Promise<EditValues> {
        const values: EditValues = {};
        const filesActions: Promise<unknown>[] = [];
        for (const [key, value] of Object.entries(inputValues)) {
            if (!value || typeof value !== 'object') {
                values[key] = value;
                continue;
            }
            if ('type' in value && value.type === 'files') {
                // TODO: checking wether it has changes shouldn't be necessary, because it is undefined, if not there
                if (edit && !FilesInputValuesProcessor.hasChanges(value)) {
                    continue;
                }
                const finalFiles =
                    FilesInputValuesProcessor.getCleanedFiles(value);
                // add all new files to the array (-> async upload blobs -> uploads are parallized)
                for (const [fileName, newFile] of Object.entries(
                    value.newFiles
                )) {
                    if (newFile.blobId) {
                        // the blob has already been uploaded
                        this.addUploadToFinalFiles(
                            finalFiles,
                            newFile.blobId,
                            newFile,
                            fileName
                        );
                        continue;
                    }
                    // upload the blob
                    filesActions.push(
                        this.cacheClientService
                            .handleAction({
                                type: 'blobs',
                                action: {
                                    kind: 'uploadBlob',
                                    options: {
                                        blob: newFile.blob,
                                    },
                                },
                            })
                            .then((blobId) =>
                                this.addUploadToFinalFiles(
                                    finalFiles,
                                    blobId,
                                    newFile,
                                    fileName
                                )
                            )
                    );
                }
                if (isEmpty(finalFiles) && isEmpty(value.newFiles)) {
                    values[key] = null;
                } else {
                    // the files are async added to the object
                    values[key] = finalFiles;
                }
            }
        }
        // wait until all files have been correctly updated
        await Promise.all(filesActions);
        return values;
    }

    private addUploadToFinalFiles(
        finalFiles: EditFiles,
        blobId: UUID,
        newFile: NewFile,
        fileName: string
    ) {
        if (finalFiles[fileName]) {
            errors.error({
                message: `The file ${fileName} gets overwritten!`,
                logValues: { finalFiles },
            });
        }
        // Save the blobId in the values to -> if an error occurs the user doesn't has to upload it again
        newFile.blobId = blobId;
        // The blobInformation will be added by the backend afterwards
        finalFiles[fileName] = {
            blobId,
        };
    }
}
