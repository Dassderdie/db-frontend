import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { AttributePipesModule } from '@shared/pipes/attribute/attribute-pipes.module';
import { AttributeNameComponent } from './attribute-name/attribute-name.component';
import { MetaAttributeNameComponent } from './meta-attribute-name/meta-attribute-name.component';
import { GetMetaAttributeIconPipe } from './pipes/get-meta-attribute-icon.pipe';
import { GetPluralNamePipe } from './pipes/get-plural-name.pipe';
import { TranslateMetaAttributePipe } from './pipes/translate-meta-attribute.pipe';
import { TableNameComponent } from './table-name/table-name.component';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';
import { MemberNameComponent } from './member-name/member-name.component';

@NgModule({
    declarations: [
        AttributeNameComponent,
        GetPluralNamePipe,
        TranslateMetaAttributePipe,
        MetaAttributeNameComponent,
        GetMetaAttributeIconPipe,
        TableNameComponent,
        RolePermissionsComponent,
        MemberNameComponent,
    ],
    imports: [
        CommonModule,
        IconModule,
        TranslateModule,
        DirectivesModule,
        AttributePipesModule,
        UtilityPipesModule,
        LoadingPlaceholderModule,
    ],
    exports: [
        AttributeNameComponent,
        MetaAttributeNameComponent,
        TableNameComponent,
        RolePermissionsComponent,
        MemberNameComponent,
    ],
})
export class NamesModule {}
