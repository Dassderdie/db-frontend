import type { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { IntermediateTable } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { foreignValuesAreEmpty } from '@core/cache-client/api/edit-entries/inputs-values';
import type {
    AsyncValidator,
    Validator,
} from '@shared/utility/classes/state/validator-state';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import { isEmpty } from 'lodash-es';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
    ForeignInputValues,
    NewForeignEntry,
} from './foreign-input-value';
import type { RemoveRelationArguments } from './foreign-many-relation-input/remove-relation-arguments';
import type { UpdateValueArguments } from './foreign-many-relation-input/update-value-arguments';

export class ForeignInputValuesProcessor {
    /**
     * @param value: the value that should be processed
     * @param tableId: the tableId to which the attribute belongs to
     * @param foreignEntryId: entryId to which the relation should direct
     * @param changedIntermediateValues: intermediateValues of the relation
     */
    static addNewRelation(
        value: ForeignInputValues,
        intermediateTable: IntermediateTable,
        tableId: UUID,
        attribute: ForeignAttribute,
        foreignEntryId: UUID,
        changedIntermediateValues?: NewForeignEntry['changedIntermediateValues']
    ) {
        const { entryAttributeId, foreignEntryAttributeId } =
            getForeignEntryAttributeIds(
                intermediateTable,
                tableId,
                attribute.id
            );
        const newIndex =
            value.newRelations.push({
                foreignTableId: attribute.kindOptions.foreign.tableId,
                intermediateTableId: attribute.kindOptions.intermediateTableId,
                foreignEntryId,
                entryAttributeId,
                foreignEntryAttributeId,
            }) -
            // minus 1 because push returns the new length
            1;
        if (changedIntermediateValues) {
            ForeignInputValuesProcessor.editNewRelation(
                value,
                newIndex,
                changedIntermediateValues
            );
        } else {
            value.newRelations = [...value.newRelations];
        }
    }

    static removeNewRelation(value: ForeignInputValues, index: number) {
        value.newRelations.splice(index, 1);
        value.newRelations = [...value.newRelations];
    }

    static editNewRelation(
        value: ForeignInputValues,
        index: number,
        changedIntermediateValues: NewForeignEntry['changedIntermediateValues']
    ) {
        value.newRelations[index]!.changedIntermediateValues =
            changedIntermediateValues;
        value.newRelations = [...value.newRelations];
    }

    static removePresentRelation(
        value: ForeignInputValues,
        version: Version,
        attribute: ForeignAttribute,
        args: RemoveRelationArguments,
        intermediateTable: IntermediateTable
    ) {
        const changedRelation =
            value.changedRelations[args.intermediateEntryId];
        // TODO: check wether this if can get removed and we use only the first case
        if (!changedRelation) {
            const { entryAttributeId, foreignEntryAttributeId } =
                getForeignEntryAttributeIds(
                    intermediateTable,
                    version.tableId,
                    attribute.id
                );
            // Must be an already created relation
            value.changedRelations[args.intermediateEntryId] = {
                foreignTableId: attribute.kindOptions.foreign.tableId,
                delete: true,
                intermediateTableId: attribute.kindOptions.intermediateTableId,
                entryAttributeId,
                foreignEntryAttributeId,
                foreignEntryId: args.foreignEntryId,
                entryId: version.entryId,
                // Reset intermediate values
                changedIntermediateValues: undefined,
            };
        } else {
            changedRelation.delete = true;
            // Reset intermediate values
            changedRelation.changedIntermediateValues = undefined;
        }
        value.numberOfDeletedPresentRelations++;
        value.changedRelations = { ...value.changedRelations };
    }

    static restorePresentRelation(
        value: ForeignInputValues,
        intermediateEntryId: UUID
    ) {
        if (value.changedRelations[intermediateEntryId]?.delete) {
            delete value.changedRelations[intermediateEntryId];
            value.numberOfDeletedPresentRelations--;
            value.changedRelations = { ...value.changedRelations };
        } else {
            errors.error({
                message: 'You cannot restore a relation that was not deleted',
                logValues: { value, intermediateEntryId },
            });
        }
    }

    static editPresentRelation(
        value: ForeignInputValues,
        version: Version,
        attribute: ForeignAttribute,
        args: UpdateValueArguments,
        intermediateTable: IntermediateTable
    ) {
        const changedRelation =
            value.changedRelations[args.intermediateEntryId];
        if (changedRelation) {
            if (changedRelation.delete) {
                // Deleted relations should not have changed values
                return;
            }
            if (isEmpty(args.changedIntermediateValues)) {
                // Remove this value from the changed values (and emit the valueChange later on)
                delete value.changedRelations[args.intermediateEntryId];
            } else {
                // Update the changed value
                changedRelation.changedIntermediateValues =
                    args.changedIntermediateValues;
                changedRelation.foreignEntryId = args.foreignEntryId;
            }
        } else {
            if (isEmpty(args.changedIntermediateValues)) {
                return;
            }
            const { entryAttributeId, foreignEntryAttributeId } =
                getForeignEntryAttributeIds(
                    intermediateTable,
                    version.tableId,
                    attribute.id
                );
            // If this value isn't in the changedValues yet, add it to them
            value.changedRelations[args.intermediateEntryId] = {
                foreignTableId: attribute.kindOptions.foreign.tableId,
                delete: false,
                foreignEntryId: args.foreignEntryId,
                entryAttributeId,
                foreignEntryAttributeId,
                entryId: version.entryId,
                intermediateTableId: attribute.kindOptions.intermediateTableId,
                changedIntermediateValues: args.changedIntermediateValues,
            };
        }
        value.changedRelations = { ...value.changedRelations };
    }

    static hasChanges(value: ForeignInputValues) {
        return !foreignValuesAreEmpty(value);
    }

    static getAsyncValidator(
        value: ForeignInputValues,
        attribute: ForeignAttribute,
        numberOfPresentRelations$: Observable<number>
    ): ReturnType<AsyncValidator<ForeignInputValues>> {
        if (
            typeof attribute.kindOptions.relationshipMin !== 'number' &&
            typeof attribute.kindOptions.relationshipMax !== 'number' &&
            !attribute.required
        ) {
            // Shortcut to only use numberOfPresentRelations$ if necessary (it could potentially send a request)
            return of(null);
        }
        return numberOfPresentRelations$.pipe(
            map((numberOfPresentRelations: number) => {
                const numberOfRelations =
                    ForeignInputValuesProcessor.getNumberOfRelationsAfterSave(
                        value,
                        numberOfPresentRelations
                    );
                const errors: ReturnType<Validator<any>> = {};
                if (
                    // attribute.required decides for this case
                    numberOfRelations !== 0 &&
                    typeof attribute.kindOptions.relationshipMin === 'number' &&
                    numberOfRelations < attribute.kindOptions.relationshipMin
                ) {
                    errors.relationshipMin = {
                        translationKey: _('custom-forms.foreign.min-error'),
                        min: attribute.kindOptions.relationshipMin,
                        difference:
                            attribute.kindOptions.relationshipMin -
                            numberOfRelations,
                    };
                }
                if (
                    typeof attribute.kindOptions.relationshipMax === 'number' &&
                    numberOfRelations > attribute.kindOptions.relationshipMax
                ) {
                    errors.relationshipMax = {
                        translationKey: _('custom-forms.foreign.max-error'),
                        max: attribute.kindOptions.relationshipMax,
                        difference:
                            numberOfRelations -
                            attribute.kindOptions.relationshipMax,
                    };
                }
                if (attribute.required && numberOfRelations <= 0) {
                    errors.required = {
                        translationKey: _('validators.error.required'),
                    };
                }
                return isEmpty(errors) ? null : errors;
            })
        );
    }

    public static getNumberOfRelationsAfterSave(
        value: ForeignInputValues,
        numberOfPresentRelations: number
    ) {
        return (
            numberOfPresentRelations +
            value.newRelations.length -
            value.numberOfDeletedPresentRelations
        );
    }
}
