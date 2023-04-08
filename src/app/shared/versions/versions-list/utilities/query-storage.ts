import type { ActivatedRoute, Params } from '@angular/router';
import { isEqual } from 'lodash-es';
import { combineLatest, merge, of, race, ReplaySubject, Subject } from 'rxjs';
import {
    distinctUntilChanged,
    timeout,
    switchMap,
    map,
    startWith,
} from 'rxjs/operators';
import type { QueryNavigatorService } from '@core/utility/query-navigator/query-navigator.service';
import type { MessageService } from '@core/utility/messages/message.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

/**
 * Synchronizes the value with a param in the urlQuery (if the key is specified)
 */
export class QueryStorage<T> {
    /**
     * The time until it is expected that the queryParamMap emits the query after it has been set
     */
    static readonly waitTimeout = 1000;
    private readonly destroyed = new Subject();
    private readonly valueE$ = new ReplaySubject<T>(1);
    private readonly validator$ = new ReplaySubject<(value: T) => T>(1);
    private readonly retriggerQueryToValue$ = new Subject<unknown>();

    public value$ = this.valueE$
        .asObservable()
        .pipe(distinctUntilChanged((a, b) => isEqual(a, b)));

    /**
     * @param validator validates the query and converts it to a valid one if necessary
     */
    constructor(
        private readonly key: string | undefined,
        private readonly activatedRoute: ActivatedRoute,
        private readonly queryNavigatorService: QueryNavigatorService,
        private readonly messageService: MessageService,
        /**
         * A deterministic and stateless function that converts the query into a value
         */
        private queryToValueConverter: (
            queryResult: string | null
        ) => Promise<T> | T,
        /**
         * A deterministic and stateless function that converts the value back into a query
         */
        private readonly valueToQueryConverter: (value: T) => string | null,
        validator: (value: T) => T = (v) => v
    ) {
        this.validator$.next(validator);
        if (!this.key) {
            return;
        }
        const query$ = this.activatedRoute.queryParamMap.pipe(
            map((query) => query.get(this.key!))
        );
        // wait waitTimeout for query param to emit, else use default value
        race(
            query$,
            merge(of(null).pipe(timeout(QueryStorage.waitTimeout)), query$)
        )
            .pipe(
                // repeat the query when the repeatQueryToValue$ emits
                switchMap((query) =>
                    combineLatest([
                        of(query),
                        this.retriggerQueryToValue$.pipe(startWith(null)),
                    ])
                ),
                map(([query, unknown]) => query),
                // convert the query to a value
                switchMap(async (query) => queryToValueConverter(query)),
                // validate the value with the most recent validator and always revalidate when the validator changes
                switchMap((value) =>
                    combineLatest([of(value), this.validator$])
                ),
                map(([value, validate]) => {
                    const validatedValue = validate(value);
                    if (!isEqual(validatedValue, value)) {
                        // because of distinctUntilChanged does this only update the query
                        this.setValue(validatedValue);
                        this.messageService.postMessage({
                            color: 'warning',
                            title: _(
                                'messages.query-storage.value-converted.title'
                            ),
                            body: _(
                                'messages.query-storage.value-converted.body'
                            ),
                        });
                    }
                    return validatedValue;
                })
            )
            .subscribe(this.valueE$);
    }

    /**
     * @param newValidator the validator checks the value for inconsistencies etc. It should then always return a correct value. Errors should be shown as side effects
     */
    public setValidator(newValidator: (value: T) => T) {
        // triggers reevaluation of latest value too
        this.validator$.next(newValidator);
    }

    public setQueryToValueConverter(
        newQueryToValueConverter: QueryToValueConverter<T>
    ) {
        this.queryToValueConverter = newQueryToValueConverter;
        this.retriggerQueryToValue$.next(undefined);
    }

    public async setValue(newValue: T) {
        if (this.key) {
            const params = await QueryStorage.getQueryParams(
                this.key,
                this.queryToValueConverter,
                this.valueToQueryConverter,
                newValue
            );
            // TODO: make it clear that the history should be set on a higher level
            this.queryNavigatorService.setQueryParams(params, false);
        }
        // no else, because the value emitted from the queryParams should be the same -> distinctUntilChanged
        // by directly emitting it here the value should get updated faster
        this.valueE$.next(newValue);
    }

    public destroy() {
        this.destroyed.next(undefined);
    }

    public static async getQueryParams<U>(
        key: string,
        queryToValueConverter: QueryToValueConverter<U>,
        valueToQueryConverter: (value: U) => string | null,
        newValue: U
    ): Promise<Params> {
        const encodedValue = valueToQueryConverter(newValue);
        return {
            [key]:
            // remove the query if the newValue is equal to the default one
                !encodedValue ||
                isEqual(newValue, await queryToValueConverter(null))
                    ? undefined
                    : encodedValue,
        };
    }
}

type QueryToValueConverter<U> = (queryResult: string | null) => Promise<U> | U;
