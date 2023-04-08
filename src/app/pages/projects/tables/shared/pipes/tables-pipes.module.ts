import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GetCurrentValuePipe } from './get-current-value.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [GetCurrentValuePipe],
    exports: [GetCurrentValuePipe],
})
export class TablesPipesModule {}
