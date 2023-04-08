import { Injectable } from '@angular/core';
import type { PreloadingStrategy } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type { CustomRoute } from 'src/app/app-routing.module';

@Injectable({
    providedIn: 'root',
})
export class DelayedPreloadingStrategyService implements PreloadingStrategy {
    preload(route: CustomRoute, load: () => any): Observable<unknown> {
        const preloadDelay = route.data?.preloadDelay;
        return typeof preloadDelay === 'number'
            ? timer(preloadDelay).pipe(mergeMap(() => load()))
            : of(null);
    }
}
