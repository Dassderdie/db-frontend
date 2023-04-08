import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { VersionPipesModule } from '@shared/pipes/version/version-pipes.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AttributeSimpleValueComponent } from './attribute-simple-value/attribute-simple-value.component';
import { AttributeValueComponent } from './attribute-value/attribute-value.component';
import { EntryNameComponent } from './entry-name/entry-name.component';
import { EntryTableComponent } from './entry-table/entry-table.component';
import { DisplayFilesModule } from './files/display-files.module';
import { DisplayForeignManyComponent } from './foreign/display-foreign-many/display-foreign-many.component';
import { DisplayForeignComponent } from './foreign/display-foreign/display-foreign.component';
import { ForeignManyItemCardComponent } from './foreign/foreign-many-item-card/foreign-many-item-card.component';
import { ForeignManyItemComponent } from './foreign/foreign-many-item/foreign-many-item.component';
import { DisplayForeignDividerComponent } from './foreign/display-foreign-divider/display-foreign-divider.component';
@NgModule({
    declarations: [
        AttributeSimpleValueComponent,
        AttributeValueComponent,
        DisplayForeignComponent,
        DisplayForeignManyComponent,
        EntryNameComponent,
        EntryTableComponent,
        ForeignManyItemComponent,
        ForeignManyItemCardComponent,
        DisplayForeignDividerComponent,
    ],
    imports: [
        CommonModule,
        DirectivesModule,
        ScrollingModule,
        TranslateModule,
        MarkdownViewerModule,
        IconModule,
        RouterModule,
        LoadingPlaceholderModule,
        PopoverModule.forRoot(),
        VersionPipesModule,
        UtilityPipesModule,
        DisplayFilesModule,
        DisplayDateModule,
        NamesModule,
    ],
    exports: [
        AttributeValueComponent,
        DisplayForeignManyComponent,
        EntryNameComponent,
        EntryTableComponent,
        ForeignManyItemCardComponent,
        ForeignManyItemComponent,
    ],
})
export class DisplayVersionModule {}
