import { Injectable } from '@angular/core';
import type { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { AuthenticatedService } from '../cache-client/authenticated.service';
import { AuthModalComponent } from './auth-modal/auth-modal.component';

@Injectable({
    providedIn: 'root',
})
export class AuthModalService {
    private authModal?: BsModalRef;

    constructor(
        private readonly bsModalService: BsModalService,
        private readonly authenticatedService: AuthenticatedService
    ) {}

    /**
     * Makes sure that the authModal shows up
     * @returns a promise that resolves to wether the user is authenticated after the model is closed
     */
    public async show(preSelectedTab: 'login' | 'register') {
        if (!this.authModal) {
            this.authModal = this.bsModalService.show(AuthModalComponent, {
                initialState: { preSelectedTab },
            });
        }
        return (this.authModal.content as AuthModalComponent).destroyed
            .pipe(first())
            .toPromise()
            .then(() => this.authenticatedService.isAuthenticated)
            .finally(() => (this.authModal = undefined));
    }

    public hide() {
        this.authModal?.hide();
        this.authModal = undefined;
    }
}
