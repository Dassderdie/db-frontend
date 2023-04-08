export class Api {
    public handleAction<
        Kind extends Exclude<keyof this, 'handleAction'>,
        Fct extends (options?: any) => Promise<any> = this[Kind] extends (
            options?: any
        ) => Promise<any>
            ? this[Kind]
            : never
    >(
        // intersection type to narrow type correctly
        action: {
            kind: Kind;
            options?: Parameters<Fct>[0];
        }
    ): ReturnType<Fct> {
        const actionHandler = this[action.kind as keyof this];
        if (typeof actionHandler !== 'function') {
            errors.error({
                message: 'Unknown action',
                logValues: { action },
            });
            return Promise.reject('Unknown action') as ReturnType<Fct>;
        }
        return actionHandler.bind(this)(action.options);
    }
}
