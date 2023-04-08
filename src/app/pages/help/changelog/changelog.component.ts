import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangelogComponent {}
