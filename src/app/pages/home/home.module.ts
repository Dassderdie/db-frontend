import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayChangelogModule } from '@shared/feature/display-changelog/display-changelog.module';
import { DisplayFeaturesModule } from '@shared/feature/display-features/display-features.module';
import { DisplayPitchModule } from '@shared/feature/display-pitch/display-pitch.module';
import { DisplayTutorialModule } from '@shared/feature/display-tutorial/display-tutorial.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        IconModule,
        TranslateModule,
        UtilityPipesModule,
        HomeRoutingModule,
        DisplayChangelogModule,
        DisplayFeaturesModule,
        DisplayPitchModule,
        DisplayTutorialModule,
    ],
    declarations: [HomeComponent, LandingPageComponent],
})
export class HomeModule {}
