import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { VersionPipesModule } from '@shared/pipes/version/version-pipes.module';
import { AnimatedIfModule } from '@shared/utility/components/animated-if/animated-if.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { DisplayVersionModule } from '@shared/versions/display-version/display-version.module';
import { DisplayFilesModule } from '@shared/versions/display-version/files/display-files.module';
import { FileButtonsModule } from '@shared/versions/file-buttons/file-buttons.module';
import { VersionsListModule } from '@shared/versions/versions-list/versions-list.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { GetCurrentValuePipe } from '../pipes/get-current-value.pipe';
import { SearchVersionsModule } from '../search-versions/search-versions.module';
import { AddEntriesModalComponent } from './add-entries-modal/add-entries-modal.component';
import { AttributeInputsComponent } from './attribute-inputs/attribute-inputs.component';
import { FileKindCastPipe } from './files/file-kind-cast.pipe';
import { ManyFilesInputComponent } from './files/many-files-input/many-files-input.component';
import { SingleFilesInputsComponent } from './files/single-files-inputs/single-files-inputs.component';
import { ForeignManyInputComponent } from './foreign/foreign-many-input/foreign-many-input.component';
import { ForeignManyRelationInputComponent } from './foreign/foreign-many-relation-input/foreign-many-relation-input.component';
import { ForeignSingleInputComponent } from './foreign/foreign-single-input/foreign-single-input.component';
import { CreateNewForeignEntryBtnComponent } from './foreign/create-new-foreign-entry-btn/create-new-foreign-entry-btn.component';
import { ForeignSingleIsNullPipe } from './pipes/foreign-single-is-null.pipe';
import { GetControlPipe } from './pipes/get-control.pipe';
import { GetTableDisplayNamePipe } from './pipes/get-table-display-name.pipe';
import { SingleForeignEntryIdPipe } from './pipes/single-foreign-entry-id.pipe';
import { AttributeInputComponent } from './attribute-input/attribute-input.component';
import { NewForeignManyRelationComponent } from './foreign/new-foreign-many-relation/new-foreign-many-relation.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        TranslateModule,
        DirectivesModule,
        // AddEntriesModal
        FormsModule,
        RouterModule,
        UtilityPipesModule,
        AttributePipesModule,
        VersionsListModule,
        VersionPipesModule,
        DisplayVersionModule,
        MarkdownViewerModule,
        SearchVersionsModule,
        LoadingPlaceholderModule,
        InputsModule,
        DisplayFilesModule,
        FileButtonsModule,
        NamesModule,
        CollapseIndicatorModule,
        AnimatedIfModule,
    ],
    declarations: [
        AddEntriesModalComponent,
        AttributeInputsComponent,
        ForeignManyInputComponent,
        ForeignManyRelationInputComponent,
        ForeignSingleInputComponent,
        ForeignSingleIsNullPipe,
        GetControlPipe,
        GetTableDisplayNamePipe,
        SingleForeignEntryIdPipe,
        ManyFilesInputComponent,
        SingleFilesInputsComponent,
        FileKindCastPipe,
        CreateNewForeignEntryBtnComponent,
        AttributeInputComponent,
        NewForeignManyRelationComponent,
    ],
    exports: [AttributeInputsComponent],
    providers: [GetCurrentValuePipe],
})
export class AttributeInputsModule {}
