import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { InputsModule } from '@shared/inputs/inputs.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { DisplayDateModule } from '@shared/utility/components/display-date/display-date.module';
import { LoadingButtonModule } from '@shared/utility/components/loading-button/loading-button.module';
import { ProfileComponent } from './profile/profile.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        InputsModule,
        UsersRoutingModule,
        IconModule,
        LoadingButtonModule,
        TranslateModule,
        UtilityPipesModule,
        DirectivesModule,
        DisplayDateModule,
    ],
    declarations: [ProfileComponent],
})
export class UsersModule {}
