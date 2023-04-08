import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CacheClientService } from './cache-client.service';

@Injectable({
    providedIn: 'root',
})
export class AuthenticatedService {
    private readonly isAuthenticatedE$ = new BehaviorSubject(false);
    public readonly isAuthenticated$ = this.isAuthenticatedE$.asObservable();
    public isAuthenticated = false;

    constructor(private readonly cacheClientService: CacheClientService) {
        this.isAuthenticated$.subscribe(
            (isAuthenticated) => (this.isAuthenticated = isAuthenticated)
        );
        this.cacheClientService.authEvent$.subscribe((event) => {
            switch (event) {
                case 'logged-in':
                    this.isAuthenticatedE$.next(true);
                    break;
                case 'logout':
                    // to be 100% sure nothing is cached anymore
                    // not location.replace() because it wouldn't keep the previous site in the browser history
                    location.href = '/';
                    break;
                case 'renew-login':
                    this.isAuthenticatedE$.next(false);
                    break;
                default:
                    errors.error({
                        message: `Unknown event!`,
                        logValues: { event },
                    });
            }
        });
    }
}
