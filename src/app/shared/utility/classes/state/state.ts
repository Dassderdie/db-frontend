/* eslint-disable unicorn/prefer-dom-node-remove */
/* eslint-disable unicorn/prefer-node-remove */
import type { InputType } from '@shared/inputs/input-type';
import { isEmpty } from 'lodash-es';
import type { Observable, Subscription } from 'rxjs';
import { merge, NEVER, ReplaySubject, Subject } from 'rxjs';
import { delay, map, takeUntil } from 'rxjs/operators';
import type { AsyncValidators, Validators } from './validator-state';
import { ValidatorState } from './validator-state';

/**
 * State of a group of inputs
 * e.g. whole table, an attribute, displayNames-input
 */
export class State<
    ValueType extends InputType['value'] | [string, any] = [string, any],
    ChildType extends InputType | State<any, any> = State<any, any>
> extends ValidatorState<StateValue<ValueType>> {
    /**
     * wether the state has changed
     * !do not use this directly in templates use delayedChanged$ with async-pipe instead!
     */
    get changed() {
        return !!this.changedP;
    }
    set changed(value: boolean) {
        if (value !== this.changedP) {
            this.changedP = value;
            this.changed$.next(value);
        }
    }

    constructor(
        public readonly children: {
            [key: string]: ChildType;
        } = {},
        public changedFunction: (changedChildren: boolean) => boolean = (
            changedChildren
        ) => changedChildren,
        /**
         * additional synchronous validators which determine wether the the state is invalid or valid
         * !no two validators (async and sync combined) can produce the same error!
         */
        validators: Validators<StateValue<ValueType>> = [],
        /**
         * additional synchronous validators which determine wether the the state has a warning or not
         * !no two validators (async and sync combined) can produce the same error!
         */
        warningValidators: Validators<StateValue<ValueType>> = [],
        /**
         * additional asynchronous validators which determine wether the the state is invalid or valid
         * !no two validators (async and sync combined) can produce the same error!
         */
        asyncValidators: AsyncValidators<StateValue<ValueType>> = [],
        /**
         * additional asynchronous validators which determine wether the the state has a warning or not
         * !no two validators (async and sync combined) can produce the same error!
         */
        warningAsyncValidators: AsyncValidators<StateValue<ValueType>> = []
    ) {
        super(
            {
                persistent: [
                    (value) =>
                        this.hasChildWithProperty('invalid')
                            ? {
                                  invalidChildren: {
                                      hidden: true,
                                  },
                              }
                            : null,
                ],
                adjustable: validators,
                adjustableWarnings: warningValidators,
            },
            {
                persistent: [],
                adjustable: asyncValidators,
                adjustableWarnings: warningAsyncValidators,
            }
        );
        for (const property of State.properties) {
            this.childrenProperties[property].childrenChanges
                .pipe(takeUntil(this.destroyed))
                .subscribe(({ key, newValue }) => {
                    if (this.updatePropertyForChild(property, key, newValue)) {
                        const propertyIsChanged = property === 'changed';
                        // Only update it if the property of this class has changed
                        this.updateState(!propertyIsChanged, propertyIsChanged);
                    }
                });
        }
        for (const key of Object.keys(this.children)) {
            this.registerChild(key);
        }
        this.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ key, value }) => {
                this.value[key] = value;
                this.changed = this.changedFunction(
                    this.hasChildWithProperty('changed')
                );
                this.checkValidity();
            });
        // Instantiate changed and invalid + let their observables emit the first value
        this.updateState(true, true);
    }
    static readonly properties = ['changed', 'hasWarning', 'invalid'] as const;

    /**
     * For accessing the correct `property`Changes stream of a child
     */
    static readonly propertyChangesKeys = {
        changed: 'changed$',
        invalid: 'invalid$',
        hasWarning: 'hasWarning$',
    } as const;

    public value: StateValue<ValueType> = {};
    public readonly value$ = new Subject<{
        key: string;
        value: ValueType;
    }>();

    private changedP: boolean | undefined = undefined;

    /**
     *  dictionaries of all children that are currently invalid/changed,have warnings
     */
    private readonly childrenProperties = {
        changed: new ChildProperty(),
        invalid: new ChildProperty(),
        hasWarning: new ChildProperty(),
    };

    // Do not use this directly in a template
    // Because if the state changes in a child - component the change-detection throws an
    // ExpressionHasChangedAfterItHasBeenChecked-Error and in some cases the value is not updated in the template
    /**
     * emits always the current invalid status
     * for use in templates (delayed to always correctly trigger change detection)
     */
    public readonly delayedInvalid$ = this.invalid$.pipe(delay(0));
    /**
     * emits always the current warning status
     * for use in templates (delayed to always correctly trigger change detection)
     */
    public readonly delayedWarning$ = this.hasWarning$.pipe(delay(0));
    /**
     * emits always the current changed status
     */
    public readonly changed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /**
     * emits always the current changed status
     * for use in templates (delayed to always correctly trigger change detection)
     */
    public readonly delayedChanged$ = this.changed$.pipe(delay(0));

    /**
     * a dictionary to keep track of all subscriptions of the States children
     * the subscriptions have the following order
     * [valueChanges, changedChanges, invalidChanges, warningChanges]
     */
    private readonly subscriptions: {
        [childName: string]: Subscription[];
    } = {};
    public newCreated = false;
    /**
     * wether the value-/changed-/invalid-state is still up-to-date
     */
    public upToDate = true;

    private static isState(child: InputType | State): child is State {
        return (child as State).upToDate !== undefined;
    }

    /**
     * updates the state (invalid/hasWarning, changed)
     * @param validators wether the invalid and hasWarning value should be updated
     * @param updateChanged wether the changed value should be updated
     */
    public updateState(validators: boolean, updateChanged: boolean) {
        if (validators) {
            this.checkValidity();
        }
        if (updateChanged) {
            this.changed = this.changedFunction(
                this.hasChildWithProperty('changed')
            );
        }
    }

    /**
     * adds a child at the position key
     * @param key
     * @param child
     * @param overwrite wether it is intended to overwrite a child if it already exists
     * (it will always be overwritten, but an error will be displayed if this happens unintended)
     */
    public addChild(key: string, child: ChildType, overwrite = false) {
        if (this.children[key]) {
            if (!overwrite) {
                errors.error({
                    message: `Child already exists and will be overwritten: ${key}`,
                    status: 'logError',
                });
            }
            this.removeChild(key);
        }
        this.children[key] = child;
        this.registerChild(key);
    }

    /**
     * removes the child with key from the states children
     * @param key the key of the child to be removed
     * @param error wether an error should be displayed if there is no such child
     */
    public removeChild(key: string, error = true) {
        const child = this.children[key];
        if (child) {
            child.destroy();
            for (const subscription of this.subscriptions[key]!) {
                subscription.unsubscribe();
            }
            // Remove the child from all property dictionaries
            for (const property of State.properties)
                this.updatePropertyForChild(property, key, false);
            delete this.value[key];
            delete this.subscriptions[key];
            delete this.children[key];
            this.updateState(true, true);
        } else if (error) {
            errors.error({
                message: `Unknown child: ${key}`,
            });
        }
    }

    /**
     * removes all children of this state
     */
    public removeAllChildren() {
        for (const key of Object.keys(this.children)) {
            this.removeChild(key);
        }
    }

    /**
     * replaces the current changedFunction
     * @param newChangedFunction
     */
    public updateChangedFunction(newChangedFunction: State['changedFunction']) {
        this.changedFunction = newChangedFunction;
        this.updateState(false, true);
    }

    /**
     * destroys the state
     * (clears up all the subscriptions)
     * call removeNotUpToDateChildren() on the parentStates to remove it from their children
     */
    public destroy() {
        this.upToDate = false;
        this.destroyed.next(undefined);
        this.removeAllChildren();
    }

    /**
     * removes all State children that are not up to date
     */
    public removeNotUpToDateChildren() {
        for (const [key, child] of Object.entries(this.children)) {
            if (!State.isState(child)) {
                continue;
            }
            if (child.upToDate) {
                child.removeNotUpToDateChildren();
            } else {
                this.removeChild(key);
            }
        }
    }

    /**
     * includes the child's observables into the merged observables of this state
     * @param key the key of the child in this.children
     */
    private registerChild(key: string) {
        const subscriptionsOfKey = this.subscriptions[key];
        if (subscriptionsOfKey) {
            for (const subscription of subscriptionsOfKey) {
                subscription.unsubscribe();
            }
            errors.error({
                message: `child has already been registered: ${key}`,
            });
        }
        const child = this.children[key];
        if (!child) {
            errors.error({
                message: `Unknown child: ${key}`,
            });
            return;
        }
        this.subscriptions[key] = [
            // Merge with NEVER to prevent complete-emits of the states observables
            merge(
                (child.value$ as Observable<ValueType>).pipe(
                    map((value) => ({ key, value: value! }))
                ),
                NEVER
            ).subscribe(this.value$),
            ...State.properties.map((property) =>
                merge(
                    child[State.propertyChangesKeys[property]].pipe(
                        map((newValue) => ({ key, newValue }))
                    ),
                    NEVER
                ).subscribe(this.childrenProperties[property].childrenChanges)
            ),
        ];
    }

    /**
     * Adds or removes a child from the properties dictionary according to its new property value
     * @returns wether this update has changed the property of this class
     */
    private updatePropertyForChild(
        property: PropertyType,
        key: string,
        newPropertyValue: boolean
    ): boolean {
        const oldPropertyValue = this.hasChildWithProperty(property);
        if (newPropertyValue) {
            this.childrenProperties[property].dictionary[key] = true;
        } else {
            delete this.childrenProperties[property].dictionary[key];
        }
        return oldPropertyValue !== this.hasChildWithProperty(property);
    }

    private hasChildWithProperty(property: PropertyType) {
        return !isEmpty(this.childrenProperties[property].dictionary);
    }
}

interface StateValue<ValueType> {
    [childKey: string]: ValueType;
}

class ChildProperty {
    /**
     *  dictionary of all children that currently have this property
     */
    dictionary: { [childName: string]: true } = {};
    /**
     * Emits always when for one child changed wether it has this property
     */
    childrenChanges = new Subject<{
        key: string;
        newValue: boolean;
    }>();
}

type PropertyType = typeof State.properties[number];
