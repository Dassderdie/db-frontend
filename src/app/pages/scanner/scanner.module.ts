import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { NavigationColModule } from '@shared/versions/navigation-col/navigation-col.module';
import { VersionsListModule } from '@shared/versions/versions-list/versions-list.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProjectsApiPipe } from './projects-api.pipe';
import { ScannerRoutingModule } from './scanner-routing.module';
import { ScannerComponent } from './scanner/scanner.component';

@NgModule({
    declarations: [ScannerComponent, ProjectsApiPipe],
    imports: [
        CommonModule,
        BsDropdownModule.forRoot(),
        VersionsListModule,
        UtilityPipesModule,
        NavigationColModule,
        IconModule,
        ScannerRoutingModule,
        TranslateModule,
        LoadingPlaceholderModule,
        NamesModule,
    ],
})
export class ScannerModule {}
