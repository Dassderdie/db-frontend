import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { NamesModule } from '@shared/names/names.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { AnimatedIfModule } from '@shared/utility/components/animated-if/animated-if.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { DisplayVersionModule } from '@shared/versions/display-version/display-version.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChooseTableModule } from 'src/app/pages/projects/shared/choose-table/choose-table.module';
import { GeneralPropertiesComponent } from './core/general-properties/general-properties.component';
import { ChooseActionComponent } from './pages/choose-action/choose-action.component';
import { TableComponent } from './pages/table/table.component';
import { TablesComponent } from './pages/tables/tables.component';
import { CreateForeignAttributeModalComponent } from './shared/create-foreign-attribute-modal/create-foreign-attribute-modal.component';
import { DisplayPropertiesComponent } from './shared/display-properties/display-properties.component';
import { EditAttributeComponent } from './shared/edit-attribute/edit-attribute.component';
import { EditAttributesComponent } from './shared/edit-attributes/edit-attributes.component';
import { TablesEditorRoutingModule } from './tables-editor-routing.module';

@NgModule({
    imports: [
        CommonModule,
        UtilityPipesModule,
        AttributePipesModule,
        IconModule,
        TranslateModule,
        BsDropdownModule.forRoot(),
        DirectivesModule,
        TabsModule.forRoot(),
        AnimatedIfModule,
        InputsModule,
        LoadingButtonModule,
        MarkdownViewerModule,
        RouterModule,
        DragDropModule,
        LoadingPlaceholderModule,
        ChooseTableModule,
        TablesEditorRoutingModule,
        CollapseIndicatorModule,
        DisplayVersionModule,
        NamesModule,
    ],
    declarations: [
        TablesComponent,
        TableComponent,
        GeneralPropertiesComponent,
        EditAttributeComponent,
        DisplayPropertiesComponent,
        EditAttributesComponent,
        ChooseActionComponent,
        CreateForeignAttributeModalComponent,
    ],
})
export class TablesEditorModule {}
