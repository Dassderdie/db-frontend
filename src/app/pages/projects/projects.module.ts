import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { NamesModule } from '@shared/names/names.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { MarkdownViewerModule } from '@shared/utility/components/markdown-viewer/markdown-viewer.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AddProjectsModalComponent } from './feature/add-projects-modal/add-projects-modal.component';
import { InviteModalComponent } from './feature/invite-modal/invite-modal.component';
import { NormalMembersComponent } from './feature/normal-members/normal-members.component';
import { OverviewItemComponent } from './feature/overview-item/overview-item.component';
import { PendingMembersComponent } from './feature/pending-members/pending-members.component';
import { RevokedMembersComponent } from './feature/revoked-members/revoked-members.component';
import { ChooseProjectRouteComponent } from './pages/choose-project-route/choose-project-route.component';
import { GeneralProjectSettingsComponent } from './pages/general-settings/general-settings.component';
import { ProjectListComponent } from './pages/list/list.component';
import { MemberComponent } from './pages/member/member.component';
import { MembersComponent } from './pages/members/members.component';
import { ProjectOverviewComponent } from './pages/overview/overview.component';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ChooseTableModule } from './shared/choose-table/choose-table.module';

@NgModule({
    imports: [
        CommonModule,
        UtilityPipesModule,
        ModalModule.forRoot(),
        IconModule,
        TranslateModule,
        FormsModule,
        MarkdownViewerModule,
        LoadingButtonModule,
        InputsModule,
        TabsModule.forRoot(),
        DirectivesModule,
        ProjectsRoutingModule,
        LoadingPlaceholderModule,
        DragDropModule,
        BsDropdownModule,
        ChooseTableModule,
        DirectivesModule,
        DisplayDateModule,
        NamesModule,
    ],
    declarations: [
        ProjectListComponent,
        ProjectOverviewComponent,
        AddProjectsModalComponent,
        InviteModalComponent,
        GeneralProjectSettingsComponent,
        ChooseProjectRouteComponent,
        MemberComponent,
        MembersComponent,
        OverviewItemComponent,
        RevokedMembersComponent,
        PendingMembersComponent,
        NormalMembersComponent,
    ],
})
export class ProjectsModule {}
