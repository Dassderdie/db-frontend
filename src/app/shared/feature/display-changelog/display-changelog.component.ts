import type { OnChanges, OnInit } from '@angular/core';
import {
    Component,
    Input,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { I18nService } from '@core/utility/i18n/i18n.service';
import type { SimpleChangesGeneric } from '@shared/utility/types/simple-changes-generic';
import { changelogs } from './changelogs';

@Component({
    selector: 'app-display-changelog',
    templateUrl: './display-changelog.component.html',
    styleUrls: ['./display-changelog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayChangelogComponent implements OnChanges, OnInit {
    /**
     * From which time on the changelog should be shown
     */
    @Input() startingFrom = 0;
    /**
     * Wether a link to the changelog page should be shown
     */
    @Input() showChangelogLink = true;

    public filteredChangelogs: ReadonlyArray<{
        version: string;
        releaseDate: string;
        htmlContent?: string;
    }> = [];

    private globalUpdateId = 0;

    constructor(
        private readonly i18nService: I18nService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.updateFilteredChangelogs();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        // when navigating to the changelog, navigate somewhere else and then returning to the changelog there is an error
        // that changes.startingFrom is undefined. - Maybe something with the caching and reusing of this component?
        if (!changes.startingFrom?.isFirstChange()) {
            this.updateFilteredChangelogs();
        }
    }

    private updateFilteredChangelogs() {
        this.globalUpdateId++;
        const updateId = this.globalUpdateId;
        for (const changelog of changelogs) {
            if (
                this.startingFrom &&
                new Date(changelog.releaseDate).valueOf() < this.startingFrom
            ) {
                break;
            }
            const path = this.i18nService.getLanguage(changelog.paths);
            fetch(`${baseUrl}/assets/changelogs/${path}`)
                .then(async (data) => data.text())
                .then((htmlContent) => {
                    if (updateId !== this.globalUpdateId) {
                        // the resources have been requested again
                        return;
                    }
                    this.filteredChangelogs = [
                        ...this.filteredChangelogs,
                        {
                            version: changelog.version,
                            releaseDate: changelog.releaseDate,
                            htmlContent,
                        },
                    ];
                    this.changeDetectorRef.markForCheck();
                })
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                .catch((error: any) => errors.error({ error }));
        }
    }
}
