import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { NamesModule } from '@shared/names/names.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { AnimatedIfModule } from '@shared/utility/components/animated-if/animated-if.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { DisplayVersionModule } from '@shared/versions/display-version/display-version.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FilterGroupComponent } from './filter-group/filter-group.component';
import { FilterInputComponent } from './filter-input/filter-input.component';
import { VersionsFilterEditorComponent } from './versions-filter-editor/versions-filter-editor.component';
import { InvalidExpressionComponent } from './invalid-expression/invalid-expression.component';
import { CreateNewFilterPreferenceModalComponent } from './create-new-filter-preference-modal/create-new-filter-preference-modal.component';
import { FilterPreferencesManagerModalComponent } from './filter-preferences-manager-modal/filter-preferences-manager-modal.component';

@NgModule({
    imports: [
        CommonModule,
        DirectivesModule,
        ScrollingModule,
        UtilityPipesModule,
        AttributePipesModule,
        LoadingPlaceholderModule,
        IconModule,
        TranslateModule,
        InputsModule,
        MarkdownViewerModule,
        AnimatedIfModule,
        BsDropdownModule.forRoot(),
        CollapseIndicatorModule,
        DisplayVersionModule,
        NamesModule,
        LoadingButtonModule,
        DragDropModule,
    ],
    declarations: [
        FilterGroupComponent,
        FilterInputComponent,
        VersionsFilterEditorComponent,
        InvalidExpressionComponent,
        CreateNewFilterPreferenceModalComponent,
        FilterPreferencesManagerModalComponent,
    ],
    exports: [VersionsFilterEditorComponent],
})
export class SearchVersionsModule {}
