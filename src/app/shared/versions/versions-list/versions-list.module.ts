import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { AnimatedIfModule } from '@shared/utility/components/animated-if/animated-if.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ValidationModule } from '@shared/inputs/shared/validation/validation.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { CdkTableModule } from '@angular/cdk/table';
import { DisplayVersionModule } from '../display-version/display-version.module';
import { MetaAttributeValueComponent } from './meta-attribute-value/meta-attribute-value.component';
import { GetSortIconPipe } from './pipes/get-sort-icon.pipe';
import { IsMetaAttributeKeyPipe } from './pipes/is-meta-attribute-key.pipe';
import { VersionsListComponent } from './versions-list/versions-list.component';
import { AttributeColNameComponent } from './attribute-col-name/attribute-col-name.component';
import { AddColumnDropdownComponent } from './column-orders-preferences/add-column-dropdown/add-column-dropdown.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { ColumnOrderPreferenceSelectorComponent } from './column-orders-preferences/column-order-preference-selector/column-order-preference-selector.component';
import { ColumnOrdersPreferenceManagerModalComponent } from './column-orders-preferences/column-orders-preference-manager-modal/column-orders-preference-manager-modal.component';
import { CreateColumnOrderPreferenceModalComponent } from './column-orders-preferences/create-column-order-preference-modal/create-column-order-preference-modal.component';

@NgModule({
    declarations: [
        MetaAttributeValueComponent,
        VersionsListComponent,
        GetSortIconPipe,
        IsMetaAttributeKeyPipe,
        AttributeColNameComponent,
        AddColumnDropdownComponent,
        SearchResultsComponent,
        ColumnOrderPreferenceSelectorComponent,
        ColumnOrdersPreferenceManagerModalComponent,
        CreateColumnOrderPreferenceModalComponent,
    ],
    imports: [
        AnimatedIfModule,
        CdkTableModule,
        CommonModule,
        DirectivesModule,
        LoadingPlaceholderModule,
        IconModule,
        TranslateModule,
        BsDropdownModule.forRoot(),
        DisplayVersionModule,
        RouterModule,
        UtilityPipesModule,
        AttributePipesModule,
        CollapseIndicatorModule,
        DisplayDateModule,
        NamesModule,
        ValidationModule,
        LoadingButtonModule,
        DragDropModule,
        InputsModule,
    ],
    exports: [VersionsListComponent, SearchResultsComponent],
})
export class VersionsListModule {}
