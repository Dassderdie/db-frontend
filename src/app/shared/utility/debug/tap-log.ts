import { tap } from 'rxjs/operators';

/**
 * This should only be used for debugging purposes of rxjs Observables
 * @deprecated - to make sure it is not used in production code
 */
export const tapLog = tap((item) => console.log(item));
