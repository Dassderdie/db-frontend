import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { NavigationColModule } from '@shared/versions/navigation-col/navigation-col.module';
import { ShowHiddenAttributesInputModule } from '@shared/versions/show-hidden-attributes-input/show-hidden-attributes-input.module';
import { VersionsListModule } from '@shared/versions/versions-list/versions-list.module';
import { ChooseTableRouteComponent } from './pages/choose-table-route/choose-table-route.component';
import { CreateEntryComponent } from './pages/create-entry/create-entry.component';
import { EntrySearchComponent } from './pages/entry-search/entry-search.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { TableComponent } from './pages/table/table.component';
import { AnonymousButtonModule } from './shared/anonymous-button/anonymous-button.module';
import { AttributeInputsModule } from './shared/attribute-inputs/attribute-inputs.module';
import { TablesPipesModule } from './shared/pipes/tables-pipes.module';
import { SearchVersionsModule } from './shared/search-versions/search-versions.module';
import { TablesRoutingModule } from './tables-routing.module';
import { TableViewsModule } from './shared/table-views/table-views.module';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule,
        FormsModule,
        IconModule,
        DirectivesModule,
        SearchVersionsModule,
        TablesRoutingModule,
        UtilityPipesModule,
        MarkdownViewerModule,
        LoadingPlaceholderModule,
        AnonymousButtonModule,
        AttributeInputsModule,
        TablesPipesModule,
        VersionsListModule,
        NavigationColModule,
        ShowHiddenAttributesInputModule,
        NamesModule,
        TableViewsModule,
    ],
    declarations: [
        CreateEntryComponent,
        ChooseTableRouteComponent,
        TableComponent,
        EntrySearchComponent,
        StatisticsComponent,
    ],
})
export class TablesModule {}
