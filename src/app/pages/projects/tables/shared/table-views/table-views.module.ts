import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { NamesModule } from '@shared/names/names.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ValidationModule } from '@shared/inputs/shared/validation/validation.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { TableViewEditorComponent } from './table-view-editor/table-view-editor.component';
import { TableViewEditorModalComponent } from './table-view-editor-modal/table-view-editor-modal.component';

@NgModule({
    declarations: [TableViewEditorComponent, TableViewEditorModalComponent],
    imports: [
        CommonModule,
        TranslateModule,
        IconModule,
        DirectivesModule,
        UtilityPipesModule,
        NamesModule,
        BsDropdownModule.forRoot(),
        DragDropModule,
        ValidationModule,
        LoadingButtonModule,
        LoadingPlaceholderModule,
        AttributePipesModule,
    ],
})
export class TableViewsModule {}
