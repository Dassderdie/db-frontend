import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { DisplayVersionModule } from '@shared/versions/display-version/display-version.module';
import { DisplayFilesModule } from '@shared/versions/display-version/files/display-files.module';
import { FileButtonsModule } from '@shared/versions/file-buttons/file-buttons.module';
import { ShowHiddenAttributesInputModule } from '@shared/versions/show-hidden-attributes-input/show-hidden-attributes-input.module';
import { AnonymousButtonModule } from '@tables/shared/anonymous-button/anonymous-button.module';
import { AttributeInputsModule } from '@tables/shared/attribute-inputs/attribute-inputs.module';
import { TablesPipesModule } from '@tables/shared/pipes/tables-pipes.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { EntriesRoutingModule } from './entries-routing.module';
import { ChooseEntryRouteComponent } from './pages/choose-entry-route/choose-entry-route.component';
import { EditEntryComponent } from './pages/edit-entry/edit-entry.component';
import { EntryHistoryComponent } from './pages/entry-history/entry-history.component';
import { EntryOverviewComponent } from './pages/entry-overview/entry-overview.component';
import { EntryComponent } from './pages/entry/entry.component';
import { GetQrCodeDataUrlPipe } from './shared/pipes/get-qr-code-data-url.pipe';
import { EntryRelationExplorerComponent } from './pages/entry-relation-explorer/entry-relation-explorer.component';
import { ShowRelationExplorerPipe } from './shared/pipes/show-relation-explorer.pipe';
import { SelectForeignAttributesComponent } from './feature/relation-explorer/select-foreign-attributes/select-foreign-attributes.component';
import { FilesChangesComponent } from './feature/history/files-changes/files-changes.component';
import { ForeignChangesComponent } from './feature/history/foreign-changes/foreign-changes.component';
import { ForeignManyItemChangesComponent } from './feature/history/foreign-many-item-changes/foreign-many-item-changes.component';
import { VersionHasChangesPipe } from './feature/history/pipes/version-has-changes.pipe';
import { VersionChangesComponent } from './feature/history/version-changes/version-changes.component';
import { RelationExplorerComponent } from './feature/relation-explorer/relation-explorer/relation-explorer.component';
import { TablesLegendComponent } from './feature/relation-explorer/tables-legend/tables-legend.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        EntriesRoutingModule,
        IconModule,
        DirectivesModule,
        TranslateModule,
        AnonymousButtonModule,
        AttributeInputsModule,
        AttributePipesModule,
        UtilityPipesModule,
        AttributePipesModule,
        LoadingPlaceholderModule,
        DisplayVersionModule,
        TablesPipesModule,
        DisplayFilesModule,
        BsDropdownModule.forRoot(),
        DisplayDateModule,
        CollapseIndicatorModule,
        FileButtonsModule,
        DisplayDateModule,
        ShowHiddenAttributesInputModule,
        NamesModule,
    ],
    declarations: [
        EntryComponent,
        EditEntryComponent,
        EntryHistoryComponent,
        EntryOverviewComponent,
        ChooseEntryRouteComponent,
        VersionHasChangesPipe,
        VersionChangesComponent,
        ForeignChangesComponent,
        ForeignManyItemChangesComponent,
        FilesChangesComponent,
        GetQrCodeDataUrlPipe,
        RelationExplorerComponent,
        EntryRelationExplorerComponent,
        ShowRelationExplorerPipe,
        SelectForeignAttributesComponent,
        TablesLegendComponent,
    ],
})
export class EntriesModule {}
