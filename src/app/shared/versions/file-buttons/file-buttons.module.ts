import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { FileButtonsComponent } from './file-buttons/file-buttons.component';

@NgModule({
    declarations: [FileButtonsComponent],
    imports: [CommonModule, IconModule, TranslateModule, DirectivesModule],
    exports: [FileButtonsComponent],
})
export class FileButtonsModule {}
