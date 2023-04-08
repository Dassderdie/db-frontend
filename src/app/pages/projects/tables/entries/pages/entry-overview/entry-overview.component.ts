import { DatePipe } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import {
    ChangeDetectionStrategy,
    Component,
    ChangeDetectorRef,
} from '@angular/core';
import type { Params } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import type { Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { VersionsService } from '@core/cache-client/api/versions/versions.service';
import { ShareService } from '@core/utility/share/share.service';
import { getEntryRouteParams } from '@entries/get-entry-route-params';
import { Destroyed } from '@shared/utility/classes/destroyed';
import { shortenUrl } from '@shared/utility/functions/shorten-url';
import { copyEntryKey } from '@tables/pages/create-entry/copy-entry-key';
import { jsPDF } from 'jspdf';
import * as qrCode from 'qrcode';
import { switchMap, takeUntil } from 'rxjs/operators';
import type { EntryOverviewQueryParams } from './entry-overview-query-params';

@Component({
    selector: 'app-entry-overview',
    templateUrl: './entry-overview.component.html',
    styleUrls: ['./entry-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryOverviewComponent
    extends Destroyed
    implements OnDestroy, OnInit
{
    public newestVersion?: Version;
    public table?: Table;
    public url = '';
    public currentDate = Date.now();
    private entryId?: UUID;
    /**
     * Wether hidden attributes should be shown
     */
    public showHidden = false;
    public showEntryCreateShortcuts?: boolean;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly tablesService: TablesService,
        private readonly versionsService: VersionsService,
        private readonly datePipe: DatePipe,
        private readonly router: Router,
        public readonly shareService: ShareService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
        super();
        this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroyed))
            .subscribe((queryParams: EntryOverviewQueryParams) => {
                this.showEntryCreateShortcuts ??=
                    !!queryParams.showCreateShortcut;
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnInit() {
        const params$ = getEntryRouteParams(this.activatedRoute);
        params$.pipe(takeUntil(this.destroyed)).subscribe((params) => {
            this.entryId = params.entryId;
            this.url = shortenUrl(window.location.href);
        });
        params$
            .pipe(
                switchMap(({ projectId, tableId }) =>
                    this.tablesService.getTable(projectId, tableId)
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((table) => {
                this.table = table;
                this.changeDetectorRef.markForCheck();
            });
        params$
            .pipe(
                switchMap(({ projectId, tableId, entryId }) =>
                    this.versionsService.getNewestVersion(
                        projectId,
                        tableId,
                        entryId
                    )
                ),
                takeUntil(this.destroyed)
            )
            .subscribe((newestVersion) => {
                if (!newestVersion) {
                    errors.error({
                        message: `There is no such entry`,
                        logValues: window.location.href,
                    });
                }
                this.newestVersion = newestVersion;
                this.changeDetectorRef.markForCheck();
            });
    }

    public async downloadLabel() {
        const pdf = new jsPDF('portrait', 'px', [200, 220]);
        const imageData = await qrCode.toDataURL(this.url, {
            margin: 2,
            errorCorrectionLevel: 'H',
        });
        pdf.addImage(
            imageData,
            'PNG',
            0,
            0,
            pdf.internal.pageSize.getWidth(),
            pdf.internal.pageSize.getWidth()
        );
        let name = this.newestVersion!.values[this.table!.attributes[0]!.id];
        if (name) {
            if (typeof name === 'object') {
                name = '???';
            }
            // TODO: Improve support for long names
            name = name.toString().slice(0, 20);
        }
        pdf.text(
            `${name} (${this.datePipe.transform(Date.now(), 'shortDate')})`,
            5,
            212
        );
        pdf.save(`label${this.newestVersion!.entryId}.pdf`);
        this.changeDetectorRef.markForCheck();
    }

    public createSimilarEntry() {
        if (!this.entryId) {
            return;
        }
        const queryParams: Params = {
            [copyEntryKey]: this.entryId,
        };
        this.router.navigate(['../../../new'], {
            relativeTo: this.activatedRoute,
            queryParams,
        });
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
