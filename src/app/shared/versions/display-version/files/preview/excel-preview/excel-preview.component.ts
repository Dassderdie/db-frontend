import type { OnChanges } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    NgZone,
} from '@angular/core';
import type { JsonObject } from '@shared/utility/types/json-object';
// @ts-expect-error canvas datagrid has no @types
import canvasDatagrid from 'canvas-datagrid';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-excel-preview',
    templateUrl: './excel-preview.component.html',
    styleUrls: ['./excel-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExcelPreviewComponent implements OnChanges {
    @Input() blob!: Blob;
    @Input() blobUrl!: string;
    /**
     * the container in which the sheets should be displayed
     */
    @ViewChild('container') set content(content: ElementRef<HTMLDivElement>) {
        if (content) {
            // initially setter gets called with undefined
            this.container = content.nativeElement;
            this.updateXlsx();
        }
    }
    private container?: HTMLDivElement;

    // for displaying sheets with xlsx
    private xlsxData?: ReadonlyArray<ReadonlyArray<JsonObject>>;
    public parsingConfirmed = false;

    constructor(
        private readonly ngZone: NgZone,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnChanges() {
        this.parsingConfirmed = false;
        this.changeDetectorRef.markForCheck();
        this.xlsxData = undefined;
        this.updateXlsx();
    }

    public confirmParsing() {
        this.parsingConfirmed = true;
        this.changeDetectorRef.markForCheck();
        this.updateXlsx();
    }

    private updateXlsx() {
        if (!this.container || !this.parsingConfirmed) {
            return;
        }
        this.ngZone.runOutsideAngular(() => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook: XLSX.WorkBook = XLSX.read(
                    new Uint8Array(reader.result as ArrayBuffer),
                    {
                        type: 'array',
                        cellDates: true,
                        dateNF: '22',
                    }
                );
                // TODO: display multiple sheets
                // grab first sheet
                const worksheet: XLSX.WorkSheet =
                    workbook.Sheets[workbook.SheetNames[0]!]!;
                // save data
                this.xlsxData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    // important for correct visualisation with canvas-datagrid
                    defval: '',
                    blankrows: true,
                });
                // create a spreadsheet
                const grid = canvasDatagrid({
                    parentNode: this.container!,
                });
                grid.attributes.columnHeaderClickBehavior = 'select';
                grid.attributes.editable = false;
                grid.style.columnHeaderCellHorizontalAlignment = 'center';
                grid.style.height = '100%';
                grid.style.width = '100%';
                grid.data = this.xlsxData;
            };
            reader.readAsArrayBuffer(this.blob);
        });
    }
}
