import type { UUID } from '@cache-server/api/uuid';
import type { InputsValues } from '@core/cache-client/api/edit-entries/inputs-values';

export interface UpdateValueArguments {
    intermediateEntryId: UUID;
    foreignEntryId: UUID;
    changedIntermediateValues: InputsValues;
}
