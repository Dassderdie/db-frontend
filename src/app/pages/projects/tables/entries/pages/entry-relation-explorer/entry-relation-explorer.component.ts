import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getEntryRouteParams } from '@entries/get-entry-route-params';

@Component({
    selector: 'app-entry-relation-explorer',
    templateUrl: './entry-relation-explorer.component.html',
    styleUrls: ['./entry-relation-explorer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryRelationExplorerComponent {
    public readonly params$;

    constructor(private readonly activatedRoute: ActivatedRoute) {
        this.params$ = getEntryRouteParams(this.activatedRoute);
    }
}
