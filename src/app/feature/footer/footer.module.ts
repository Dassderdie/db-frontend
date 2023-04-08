import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '@main-shared/icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './footer.component';

@NgModule({
    imports: [CommonModule, IconModule, RouterModule, TranslateModule],
    declarations: [FooterComponent],
    exports: [FooterComponent],
})
export class FooterModule {}
