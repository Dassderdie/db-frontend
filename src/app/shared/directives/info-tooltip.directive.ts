/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/no-input-rename */
import type { OnDestroy, TemplateRef } from '@angular/core';
import {
    Directive,
    Input,
    ElementRef,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { PositioningService } from 'ngx-bootstrap/positioning';
import { TooltipConfig, TooltipDirective } from 'ngx-bootstrap/tooltip';

@Directive({
    selector: '[appInfoTooltip]',
})
export class InfoTooltipDirective
    extends TooltipDirective
    implements OnDestroy
{
    @Input() set appInfoTooltip(body: TemplateRef<unknown> | string) {
        this.tooltip = body;
    }
    @Input() isDisabled!: boolean;
    @Input('isOpen') set _isOpen(v: boolean) {
        this.isOpen = v;
    }
    @Input() triggers = 'mouseenter:mouseleave';
    /**
     * should be disabled when there are position issues
     */
    @Input() adaptivePosition = true;
    @Input() placement: 'auto' | 'bottom' | 'left' | 'right' | 'top' = 'auto';
    /**
     * Which color-style the element should have
     */
    @Input() set tooltipStyle(style: 'dark' | 'light') {
        this.containerClass = style;
    }

    constructor(
        _viewContainerRef: ViewContainerRef,
        cis: ComponentLoaderFactory,
        config: TooltipConfig,
        _elementRef: ElementRef<HTMLElement>,
        _renderer: Renderer2,
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
        this.delay = 750;
        this.container = 'body';
        this.containerClass = 'dark';
    }
}
