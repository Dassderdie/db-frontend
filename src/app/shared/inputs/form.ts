import { State } from '@shared/utility/classes/state/state';
import type { InputType } from './input-type';

export class Form<
    T extends ReadonlyArray<InputType> = ReadonlyArray<InputType>,
    U = T[any]['value']
> extends State<U, T[any]> {
    constructor(public readonly controls: T) {
        super(
            // Do this in a lambda function, because the super call has to be the first thing to be called
            ((allControls: T) => {
                // Pack the controls into an dictionary
                const children: {
                    [key: string]: T[any];
                } = {};
                for (const control of allControls) {
                    children[control.name] = control;
                }
                return children;
            })(controls)
        );
    }

    /**
     * Get the control with the correct name
     * @param name of the Input
     * @returns the InputControl
     */
    public get(name: string): T[any] | undefined {
        if (this.children[name]) {
            return this.children[name];
        }
        errors.error({
            message: `Unknown control-name: ${name}`,
        });
        return undefined;
    }

    public reset() {
        for (const control of this.controls) {
            control.resetValue();
        }
    }

    /**
     * sets the disabled status of all controls
     * @param disabled wether all controls should be disabled (true) or enabled (false)
     */
    public setDisabled(disabled: boolean) {
        for (const control of this.controls) {
            control.setDisabled(disabled);
        }
    }
}
