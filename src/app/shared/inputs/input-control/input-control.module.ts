import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputControlDirective } from './input-control.directive';

@NgModule({
    declarations: [InputControlDirective],
    imports: [CommonModule],
    exports: [InputControlDirective],
})
export class InputControlModule {}
