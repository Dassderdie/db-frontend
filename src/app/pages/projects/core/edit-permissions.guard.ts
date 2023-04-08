import type { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { RolesService } from '@core/cache-client/api/roles/roles.service';
import { Destroyed } from '@shared/utility/classes/destroyed';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, first, map, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EditPermissionsGuard
    extends Destroyed
    implements CanActivate, OnDestroy
{
    constructor(private readonly rolesService: RolesService) {
        super();
    }

    canActivate(
        next: ActivatedRouteSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const projectId = next.paramMap.get('project');
        if (!projectId) {
            errors.error({ message: 'Route has no projectId' });
            return false;
        }
        const canActivateRoute$ = this.rolesService
            .getRole(projectId)
            .pipe(map((role) => role.givePermissions));
        // error-handling in tap() doesn't work (?bug?)
        canActivateRoute$.pipe(first(), takeUntil(this.destroyed)).subscribe(
            (r) => {
                errors.assert(r, {
                    status: 'error',
                    message: 'Unexpected response or to low permissions!',
                });
            },
            (error: any) => errors.error({ error })
        );
        return canActivateRoute$.pipe(catchError((err: unknown) => of(false)));
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
