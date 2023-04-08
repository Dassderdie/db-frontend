import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AnimatedIfComponent } from './animated-if.component';

@NgModule({
    declarations: [AnimatedIfComponent],
    imports: [CommonModule],
    exports: [AnimatedIfComponent],
})
export class AnimatedIfModule {}
