import type { Languages } from '@core/utility/i18n/languages';
import type { UUID } from '../uuid';

export interface User {
    readonly id: UUID;
    readonly name: string;
    readonly authenticationEmail: string;
    readonly createdAt: string;
    /**
     * {
     *      abc@def.de: '2019-06-10T22:10:14.176Z'
     * }
     */
    readonly emails: {
        readonly [email: string]: string;
    };
    /**
     * will be there after the user has been authenticated
     */
    readonly notificationEmail: string;
    readonly publicEmail: string | null;
    readonly language?: keyof Languages<unknown>;
    readonly expiresAt?: string;
}
