import { Injectable } from '@angular/core';
import type { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class QueryNavigatorService {
    private readonly navigations: (() => Promise<boolean>)[] = [];
    private navigationSemaphore = false;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router
    ) {}

    public setQueryParams(
        queryParams: Params | null | undefined,
        updateHistory: boolean
    ) {
        this.navigations.push(async () =>
            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams,
                replaceUrl: updateHistory,
                queryParamsHandling: 'merge',
            })
        );
        this.tryNavigating();
    }

    /**
     *  helper function to execute the navigations serialized in order
     */
    private async tryNavigating() {
        if (this.navigationSemaphore || !this.navigations.length) {
            return;
        }
        this.navigationSemaphore = true;
        const navigation = this.navigations.shift()!;
        await navigation();
        this.navigationSemaphore = false;
        this.tryNavigating();
    }
}
