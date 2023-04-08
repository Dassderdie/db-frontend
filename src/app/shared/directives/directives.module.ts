import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AutoFocusDirective } from './auto-focus.directive';
import { InfoTooltipDirective } from './info-tooltip.directive';
import { IsVisibleDirective } from './is-visible.directive';
import { OutsideClickDirective } from './outside-click.directive';

@NgModule({
    imports: [CommonModule, TooltipModule.forRoot()],
    declarations: [
        OutsideClickDirective,
        AutoFocusDirective,
        IsVisibleDirective,
        InfoTooltipDirective,
    ],
    exports: [
        OutsideClickDirective,
        AutoFocusDirective,
        IsVisibleDirective,
        InfoTooltipDirective,
    ],
})
export class DirectivesModule {}
