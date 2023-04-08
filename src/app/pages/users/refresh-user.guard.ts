import { Injectable } from '@angular/core';
import type {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { UsersService } from '@core/cache-client/api/users/users.service';

@Injectable({
    providedIn: 'root',
})
export class RefreshUserGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        return this.usersService.updateUser().then((user) => true);
    }
}
