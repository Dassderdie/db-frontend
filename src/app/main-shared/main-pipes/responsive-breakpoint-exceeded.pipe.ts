import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Breakpoints } from '@core/utility/window-values/breakpoints';
import { WindowValuesService } from '@core/utility/window-values/window-values.service';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'responsiveBreakpointExceeded',
})
export class ResponsiveBreakpointExceededPipe implements PipeTransform {
    constructor(private readonly windowValuesService: WindowValuesService) {}

    /**
     * usage like this:
     * component:
     * ```ts
     *     // To use it in template
     *     public Breakpoints = Breakpoints;
     * ```
     * template:
     * ```html
     * <!-- Only show on screens larger than md -->
     *  <div
     *      *ngIf="
     *          Breakpoints.md
     *              |responsiveBreakpointExceeded
     *              | async
     *      "
     *  >
     * </div>
     * ```
     * @param breakpoint
     * @returns true if the window is larger than the breakpoints specified size
     */
    transform(breakpoint: Breakpoints): Observable<boolean> {
        return this.windowValuesService.responsiveBreakpoint$.pipe(
            map((currentBreakpoint) => breakpoint < currentBreakpoint)
        );
    }
}
