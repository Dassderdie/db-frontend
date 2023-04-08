import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type {
    Attribute,
    ForeignAttribute,
} from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { FilesValue, Version } from '@cache-server/api/versions/version';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { MessageService } from '@core/utility/messages/message.service';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import { presentForeignRelationsFilter } from '@shared/versions/display-version/foreign/present-foreign-relations-filter';
import { ForeignInputValues } from '@tables/shared/attribute-inputs/foreign/foreign-input-value';
import { ForeignInputValuesProcessor } from '@tables/shared/attribute-inputs/foreign/foreign-input-values-processor';
import { isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, of, throwError } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CopyEntryService {
    constructor(
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly messageService: MessageService
    ) {}

    /**
     *
     * @param entryId
     * @param tableId
     * @param projectId
     * @param maximumForeignRelations the maximum of foreign relations that will be put into the returned inputsValues
     * (if undefined the defaultLimit will be used)
     * @returns an Observable that emits an inputValues representation of the specified entry (e.g. to copy an entry)
     */
    public getInputsValues(
        entryId: UUID,
        tableId: UUID,
        projectId: UUID,
        maximumForeignRelations?: number
    ): Observable<InputsValues> {
        return combineLatest([
            this.tablesService.getTable(projectId, tableId).pipe(first()),
            this.versionsService
                .getNewestVersion(projectId, tableId, entryId)
                .pipe(first()),
        ]).pipe(
            switchMap(([table, entry]) => {
                if (!entry) {
                    return throwError(Error(`There is no entry ${entryId}`));
                }
                return this.getInputsValuesFromAttributes(
                    table.attributes,
                    entry,
                    maximumForeignRelations
                );
            })
        );
    }

    private getInputsValuesFromAttributes(
        attributes: ReadonlyArray<Attribute>,
        entry: Version,
        maximumForeignRelations?: number
    ): Observable<InputsValues> {
        const inputsValues: InputsValues = {};
        /**
         * the streams that emit the foreignValues for the foreign-attributes
         */
        const foreignAttributeStreams: Observable<
            | {
                  foreignValues: ForeignInputValues;
                  attributeId: UUID;
              }
            | undefined
        >[] = [];
        for (const attribute of attributes) {
            switch (attribute.kind) {
                case 'foreign':
                    foreignAttributeStreams.push(
                        // Get the intermediateTable
                        this.tablesService
                            .getTable<IntermediateTable>(
                                entry.projectId,
                                attribute.kindOptions.intermediateTableId
                            )
                            .pipe(
                                first(),
                                switchMap((intermediateTable) =>
                                    this.getForeignAttributeStream(
                                        attribute,
                                        intermediateTable,
                                        entry,
                                        maximumForeignRelations
                                    )
                                )
                            )
                    );
                    break;
                case 'files':
                    if (!isEmpty(entry.values[attribute.id] as FilesValue)) {
                        // It is bad table design if files should be copied
                        this.messageService.postMessage({
                            color: 'info',
                            title: _('copy-entry.files-not-copied.title'),
                            body: _('copy-entry.files-not-copied.body'),
                        });
                    }
                    break;
                default: {
                    const attributeValue = entry.values[attribute.id];
                    // typeof null === 'object'
                    if (typeof attributeValue !== 'object') {
                        inputsValues[attribute.id] = attributeValue!;
                    }
                }
            }
        }
        if (foreignAttributeStreams.length === 0) {
            // There is no foreignAttribute in this table
            return of(inputsValues);
        }
        return combineLatest(foreignAttributeStreams).pipe(
            map((foreignAttributes) => {
                for (const foreignAttribute of foreignAttributes) {
                    if (foreignAttribute) {
                        inputsValues[foreignAttribute.attributeId] =
                            foreignAttribute.foreignValues;
                    }
                }
                return inputsValues;
            })
        );
    }

    private getForeignAttributeStream(
        attribute: ForeignAttribute,
        intermediateTable: IntermediateTable,
        entry: Version,
        maximumForeignRelations?: number
    ): Observable<
        | {
              foreignValues: ForeignInputValues;
              attributeId: UUID;
          }
        | undefined
    > {
        const ownAttributeId = getForeignEntryAttributeIds(
            intermediateTable,
            entry.tableId,
            attribute.id
        ).entryAttributeId;
        return this.versionsService
            .getVersions(
                intermediateTable.projectId,
                intermediateTable.id,
                JSON.stringify(
                    presentForeignRelationsFilter(ownAttributeId, entry)
                ),
                undefined,
                undefined,
                undefined,
                maximumForeignRelations
            )
            .pipe(
                first(),
                switchMap((intermediateVersionResults) => {
                    if (
                        intermediateVersionResults.totalVersionCount >
                        (maximumForeignRelations ||
                            this.versionsService.defaultLimit)
                    ) {
                        this.messageService.postMessage({
                            color: 'warning',
                            title: _(
                                'copy-entry.maximum-relations-error.title'
                            ),
                            body: _('copy-entry.maximum-relations-error.body'),
                        });
                    }
                    // Get the intermediateValues
                    const changedIntermediateInputsValueStreams: Observable<InputsValues>[] =
                        [];
                    for (const intermediateVersion of intermediateVersionResults.versions) {
                        const intermediateAttributes =
                            attribute.kindOptions.intermediateAttributes;
                        if (intermediateAttributes) {
                            // Start recursion for intermediateAttributes
                            changedIntermediateInputsValueStreams.push(
                                this.getInputsValuesFromAttributes(
                                    intermediateAttributes,
                                    intermediateVersion,
                                    maximumForeignRelations
                                )
                            );
                        }
                    }
                    if (changedIntermediateInputsValueStreams.length === 0) {
                        // If there are no relations for this foreignAttribute
                        return of(undefined);
                    }
                    return combineLatest(
                        changedIntermediateInputsValueStreams
                    ).pipe(
                        first(),
                        map((changedIntermediateInputsValues) =>
                            this.generateForeignValues(
                                attribute,
                                intermediateTable,
                                changedIntermediateInputsValues,
                                entry,
                                intermediateVersionResults.versions
                            )
                        )
                    );
                })
            );
    }

    private generateForeignValues(
        attribute: ForeignAttribute,
        intermediateTable: IntermediateTable,
        changedIntermediateInputsValues: InputsValues[],
        entry: Version,
        intermediateVersions: Version[]
    ):
        | {
              foreignValues: ForeignInputValues;
              attributeId: UUID;
          }
        | undefined {
        // Add the values from the intermediateValues and the relations
        const foreignValues = new ForeignInputValues();
        let i = 0;
        for (const intermediateVersion of intermediateVersions) {
            const intermediateAttributes =
                attribute.kindOptions.intermediateAttributes;
            let changedIntermediateValues = {};
            if (intermediateAttributes) {
                changedIntermediateValues = changedIntermediateInputsValues[i]!;
                i++;
            }
            const { foreignEntryAttributeId } = getForeignEntryAttributeIds(
                intermediateTable,
                entry.tableId,
                attribute.id
            );
            ForeignInputValuesProcessor.addNewRelation(
                foreignValues,
                intermediateTable,
                entry.tableId,
                attribute,
                intermediateVersion.values[foreignEntryAttributeId] as UUID,
                changedIntermediateValues
            );
        }
        if (!ForeignInputValuesProcessor.hasChanges(foreignValues)) {
            errors.error({
                message:
                    'if there are no foreign relations generateForeignValues must not be called',
            });
            return undefined;
        }
        return {
            attributeId: attribute.id,
            foreignValues,
        };
    }
}
