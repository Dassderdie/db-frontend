import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { AuthModalService } from '@core/auth-modal/auth-modal.service';
import { AuthenticatedService } from '@core/cache-client/authenticated.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authenticatedService: AuthenticatedService,
        private readonly authModalService: AuthModalService,
        private readonly router: Router
    ) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        const authenticated =
            this.authenticatedService.isAuthenticated ||
            (await this.authModalService.show('login'));
        return authenticated ? true : this.router.parseUrl('/');
    }

    async canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        return this.canActivate(next, state);
    }
}
