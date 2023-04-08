import type { OnChanges, OnDestroy, TemplateRef } from '@angular/core';
import {
    Directive,
    Input,
    ElementRef,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { I18nService } from '@core/utility/i18n/i18n.service';
import type { Languages } from '@core/utility/i18n/languages';
import { TranslateService } from '@ngx-translate/core';
import { InfoTooltipDirective } from '@shared/directives/info-tooltip.directive';
import type { Destroyed } from '@shared/utility/classes/destroyed';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { PositioningService } from 'ngx-bootstrap/positioning';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appDescriptionTooltip]',
})
export class DescriptionTooltipDirective
    extends InfoTooltipDirective
    implements OnChanges, OnDestroy, Destroyed
{
    /**
     * this should be always be a template with
     * ```html
     * <app-description [description]="description"></app-description>
     * ```
     */
    @Input() set appDescriptionTooltip(body: TemplateRef<unknown> | string) {
        this.tooltip = body;
    }
    @Input() description?: Languages<string | null> | string;
    @Input() alsoDisabled = false;

    readonly destroyed = new Subject();
    isDisabled = false;
    private changeNr = 0;

    constructor(
        private readonly translateService: TranslateService,
        private readonly i18nService: I18nService,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _viewContainerRef: ViewContainerRef,
        cis: ComponentLoaderFactory,
        config: TooltipConfig,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _elementRef: ElementRef<HTMLElement>,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _renderer: Renderer2,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _positionService: PositioningService
    ) {
        super(
            _viewContainerRef,
            cis,
            config,
            _elementRef,
            _renderer,
            _positionService
        );
    }

    ngOnChanges() {
        // set isDisabled
        if (this.alsoDisabled || !this.description) {
            this.isDisabled = true;
        } else if (typeof this.description === 'string') {
            const currentChangeNr = this.changeNr;
            this.isDisabled = false;
            // Check wether translation is available
            this.translateService
                .get(this.description)
                .pipe(takeUntil(this.destroyed))
                .subscribe((translation) => {
                    if (currentChangeNr === this.changeNr) {
                        this.isDisabled = !translation;
                    }
                });
        } else {
            this.isDisabled = !this.i18nService.getLanguage(this.description);
        }
        // user generated descriptions should be light themed
        this.tooltipStyle =
            typeof this.description === 'string' ? 'dark' : 'light';
        this.changeNr++;
    }

    ngOnDestroy() {
        this.destroyed.next(undefined);
    }
}
