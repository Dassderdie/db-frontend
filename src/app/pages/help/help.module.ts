import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@shared/directives/directives.module';
import { DisplayChangelogModule } from '@shared/feature/display-changelog/display-changelog.module';
import { DisplayFeaturesModule } from '@shared/feature/display-features/display-features.module';
import { DisplayPitchModule } from '@shared/feature/display-pitch/display-pitch.module';
import { DisplayTutorialModule } from '@shared/feature/display-tutorial/display-tutorial.module';
import { UtilityPipesModule } from '@shared/pipes/utility/utility-pipes.module';
import { AnimatedIfModule } from '@shared/utility/components/animated-if/animated-if.module';
import { CollapseIndicatorModule } from '@shared/utility/components/collapse-indicator/collapse-indicator.module';
import { LoadingPlaceholderModule } from '@shared/utility/components/loading-placeholder/loading-placeholder.module';
import { ChangelogComponent } from './changelog/changelog.component';
import { FaqComponent } from './faq/faq.component';
import { FeaturesComponent } from './features/features.component';
import { HelpRoutingModule } from './help-routing.module';
import { HelpComponent } from './help/help.component';
import { LicensesComponent } from './licenses/licenses.component';
import { SupportComponent } from './support/support.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        MainPipesModule,
        RouterModule,
        HelpRoutingModule,
        IconModule,
        DisplayChangelogModule,
        FormsModule,
        DirectivesModule,
        AnimatedIfModule,
        CollapseIndicatorModule,
        DirectivesModule,
        LoadingPlaceholderModule,
        UtilityPipesModule,
        DisplayFeaturesModule,
        DisplayPitchModule,
        DisplayTutorialModule,
    ],
    declarations: [
        ChangelogComponent,
        SupportComponent,
        HelpComponent,
        FaqComponent,
        FeaturesComponent,
        LicensesComponent,
    ],
})
export class HelpModule {}
