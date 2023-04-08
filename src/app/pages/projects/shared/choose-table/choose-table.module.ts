import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { ChooseTableComponent } from './choose-table.component';

@NgModule({
    declarations: [ChooseTableComponent],
    imports: [CommonModule, TranslateModule, LoadingPlaceholderModule],
    exports: [ChooseTableComponent],
})
export class ChooseTableModule {}
