import { Injectable } from '@angular/core';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { environment } from 'src/environments/environment';
import type { CustomerConfig } from './customer-config';

@Injectable({
    providedIn: 'root',
})
export class CustomerConfigurationService {
    public config?: Promise<CustomerConfig>;

    constructor() {
        if (!environment.hasCustomerConfig) {
            return;
        }
        this.config = fetch(`${baseUrl}/assets/customer-config.json`)
            .then(async (data) => data.json())
            .catch((error) => errors.error({ error }));
    }
}
