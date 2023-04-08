import { DatePipe } from '@angular/common';
import type { OnDestroy, OnInit, TemplateRef } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpecialInputComponent } from '../shared/special-input-component';
import { DateInput } from './date-input';

@Component({
    selector: 'app-date-input',
    templateUrl: './date-input.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./date-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputComponent
    extends SpecialInputComponent
    implements OnInit, Destroyed, OnDestroy
{
    @Input() prependTemplate: TemplateRef<unknown> | null = null;
    @Input() appendTemplate: TemplateRef<unknown> | null = null;
    @Input() control!: DateInput;

    public bsValue: Date | null = null;

    readonly destroyed = new Subject();

    constructor(
        private readonly datePipe: DatePipe,
        private readonly localeService: BsLocaleService,
        private readonly languages: I18nService,
        private readonly changedDetectorRef: ChangeDetectorRef
    ) {
        super(changedDetectorRef);
    }

    ngOnInit() {
        this.languages.languageChangesBCP47$
            .pipe(takeUntil(this.destroyed))
            .subscribe((lang) => {
                this.localeService.use(lang);
                this.changedDetectorRef.markForCheck();
            });
        this.control.value$
            .pipe(takeUntil(this.destroyed))
            .subscribe((value) => {
                this.bsValue = value ? new Date(value) : null;
                this.changedDetectorRef.markForCheck();
            });
    }

    public changeValue(newValue: Date | null) {
        let formattedValue: string | null = newValue
            ? newValue.toString()
            : null;
        try {
            formattedValue = this.datePipe.transform(newValue, 'yyyy-MM-dd');
        } catch {}
        this.control.setValue(formattedValue);
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
