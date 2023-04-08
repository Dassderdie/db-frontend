import { anonymousUserId } from '@cache-server/api/users/anonymous-user-id';
import type { FilesValue, Version } from '@cache-server/api/versions/version';
import type { DeepWritable } from '@shared/utility/types/writable';
import { isEqual } from 'lodash-es';
import type { SubscriptionsHandler } from '../../subscriptions-handler/subscriptions-handler';
import { Api } from '../api';
import type { AuthHttpHandler } from '../auth-http-handler';
import type { UUID } from '../uuid';
import type { EditValues } from './edit-values';

export class EditEntriesApi extends Api {
    constructor(
        private readonly authHttp: AuthHttpHandler,
        private readonly subscriptionHandler: SubscriptionsHandler
    ) {
        super();
    }

    /**
     * Edit an entry
     */
    public async editEntry(options: {
        projectId: UUID;
        tableId: UUID;
        entryId: UUID;
        values: EditValues;
        anonymous: boolean;
        updateId: UUID | true | null;
        updateVersions: boolean;
    }): Promise<Version> {
        return this.authHttp
            .put<{
                version: Version;
            }>('/entries', {
                projectId: options.projectId,
                tableId: options.tableId,
                entryId: options.entryId,
                values: options.values,
                anonymous: options.anonymous,
                updateId: options.updateId,
            })
            .finally(() => {
                if (options.updateVersions) {
                    this.subscriptionHandler.renewItems({
                        type: 'versions',
                        action: {
                            kind: 'getVersions',
                            options: {
                                projectId: options.projectId,
                                tableId: options.tableId,
                            },
                        },
                    });
                }
            })
            .then(
                (response) => {
                    const version = response.data.version;
                    this.checkVersion(
                        options.projectId,
                        options.tableId,
                        options.values,
                        options.anonymous,
                        version,
                        options.updateId
                    );
                    this.subscriptionHandler.cache(
                        {
                            type: 'versions',
                            action: {
                                kind: 'getNewestVersion',
                                options: {
                                    projectId: version.projectId,
                                    tableId: version.tableId,
                                    entryId: version.entryId,
                                },
                            },
                        },
                        version,
                        true
                    );
                    return version;
                },
                (error) => {
                    this.subscriptionHandler.renewItems({
                        type: 'versions',
                        action: {
                            kind: 'getNewestVersion',
                            options: {
                                projectId: options.projectId,
                                tableId: options.tableId,
                                entryId: options.entryId,
                            },
                        },
                    });
                    throw error;
                }
            );
    }

    /**
     * Creates a new entry
     */
    public async createEntry(options: {
        projectId: UUID;
        tableId: UUID;
        values: EditValues;
        anonymous: boolean;
        updateId: UUID | true | null;
        updateVersions: boolean;
    }): Promise<Version> {
        return this.authHttp
            .post<{
                version: Version;
            }>('/entries', {
                projectId: options.projectId,
                tableId: options.tableId,
                values: options.values,
                anonymous: options.anonymous,
                updateId: options.updateId,
            })
            .finally(() => {
                if (options.updateVersions) {
                    this.subscriptionHandler.renewItems({
                        type: 'versions',
                        action: {
                            kind: 'getVersions',
                            options: {
                                projectId: options.projectId,
                                tableId: options.tableId,
                            },
                        },
                    });
                }
            })
            .then((response) => {
                const version = response.data.version;
                this.checkVersion(
                    options.projectId,
                    options.tableId,
                    options.values,
                    options.anonymous,
                    version,
                    options.updateId
                );
                this.subscriptionHandler.cache(
                    {
                        type: 'versions',
                        action: {
                            kind: 'getNewestVersion',
                            options: {
                                projectId: version.projectId,
                                tableId: version.tableId,
                                entryId: version.entryId,
                            },
                        },
                    },
                    version,
                    true
                );
                return version;
            });
    }

    /**
     * Delete an entry
     */
    public async deleteEntry(options: {
        projectId: UUID;
        tableId: UUID;
        entryId: UUID;
        anonymous: boolean;
        updateId: UUID | true | null;
        updateVersions: boolean;
        /**
         * The values of the entry before deletion (for response validation)
         */
        previousValues?: Version['values'] | undefined;
    }): Promise<Version> {
        return this.authHttp
            .delete<{
                version: Version;
            }>('/entries', {
                projectId: options.projectId,
                tableId: options.tableId,
                entryId: options.entryId,
                anonymous: options.anonymous,
                updateId: options.updateId,
            })
            .finally(() => {
                if (options.updateVersions) {
                    // Update all versions in this project, because foreign relations could effect results in other tables as well
                    this.subscriptionHandler.renewItems({
                        type: 'versions',
                        action: {
                            kind: 'getVersions',
                            options: {
                                projectId: options.projectId,
                                tableId: options.tableId,
                            },
                        },
                    });
                }
            })
            .then((response) => {
                const version = response.data.version;
                this.checkVersion(
                    options.projectId,
                    options.tableId,
                    options.previousValues ?? {},
                    options.anonymous,
                    version,
                    options.updateId
                );
                this.subscriptionHandler.cache(
                    {
                        type: 'versions',
                        action: {
                            kind: 'getNewestVersion',
                            options: {
                                projectId: version.projectId,
                                tableId: version.tableId,
                                entryId: version.entryId,
                            },
                        },
                    },
                    version,
                    true
                );
                return version;
            });
    }

    /**
     * logs and displays errors if the entry hasn't been updated correctly
     * @param deleted wether the version should be deleted
     * @returns whether the entry has been created/updated correctly
     */
    private async checkVersion(
        projectId: UUID,
        tableId: UUID,
        cleanedInputValues: EditValues,
        anonymous: boolean,
        createdVersion: Version,
        updateId: UUID | true | null,
        deleted = false,
        entryId?: UUID
    ): Promise<boolean> {
        return this.subscriptionHandler
            .getOneItem({
                type: 'users',
                action: {
                    kind: 'getUser',
                },
            })
            .then((user) => {
                let numberOfIncorrectSavedValues = 0;
                for (const [key, inputValue] of Object.entries(
                    cleanedInputValues
                )) {
                    const savedValue = createdVersion.values[key];
                    if (
                        typeof inputValue === 'object' &&
                        inputValue !== null &&
                        typeof savedValue === 'object' &&
                        savedValue !== null
                    ) {
                        // non empty files-value
                        for (const [fileName, savedFile] of Object.entries(
                            savedValue
                        )) {
                            // add blobInformation (which are added by the backend)
                            (
                                inputValue[fileName] as DeepWritable<
                                    FilesValue['']
                                >
                            ).blobInformation = savedFile.blobInformation;
                        }
                    }
                    if (!isEqual(inputValue, savedValue)) {
                        errors.error({
                            message: `attribute with key ${key} was incorrect updated.`,
                            logValues: {
                                expectedValue: cleanedInputValues[key],
                                actualCreatedValue: createdVersion.values[key],
                            },
                        });
                        numberOfIncorrectSavedValues++;
                    }
                }
                const checkProperties: {
                    key: keyof Version;
                    value: unknown;
                    type?: 'equal' | 'less';
                }[] = [
                    {
                        key: 'projectId',
                        value: projectId,
                    },
                    {
                        key: 'tableId',
                        value: tableId,
                    },
                    {
                        key: 'entryId',
                        value: entryId,
                    },
                    {
                        key: 'deleted',
                        value: deleted,
                    },
                    {
                        key: 'invalidatedAt',
                        value: undefined,
                    },
                    {
                        key: 'invalidatorId',
                        value: undefined,
                    },
                    {
                        key: 'creatorId',
                        value: anonymous ? anonymousUserId : user.id,
                    },
                ];
                for (const checkProperty of checkProperties) {
                    if (
                        checkProperty.value &&
                        createdVersion[checkProperty.key] !==
                            checkProperty.value
                    ) {
                        errors.error({
                            message: `${checkProperty.key} of the created version is incorrect.`,
                            logValues: {
                                expectedValue: checkProperty.value,
                                actualCreatedValue:
                                    createdVersion[checkProperty.key],
                            },
                        });
                    }
                }
                if (
                    (updateId &&
                        updateId !== true &&
                        updateId !== createdVersion.updateId) ||
                    (updateId === true && !createdVersion.updateId) ||
                    (updateId === null && createdVersion.updateId)
                ) {
                    errors.error({
                        message: `The updateId of the created version should be set accordingly to ${updateId} instead of ${createdVersion.updateId}`,
                    });
                }
                if (
                    anonymous !==
                    (createdVersion.creatorId === anonymousUserId)
                ) {
                    errors.error({
                        message: `the created version was not created respecting the anonymous attribute (${anonymous})`,
                    });
                }
                if (numberOfIncorrectSavedValues > 0) {
                    errors.error({
                        message: `The server didn't correctly save the values`,
                    });
                }
                return numberOfIncorrectSavedValues === 0;
            });
    }
}
