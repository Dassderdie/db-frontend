import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ShowMoreComponent } from './show-more/show-more.component';

@NgModule({
    declarations: [ShowMoreComponent],
    imports: [CommonModule, TranslateModule],
    exports: [ShowMoreComponent],
})
export class ShowMoreModule {}
