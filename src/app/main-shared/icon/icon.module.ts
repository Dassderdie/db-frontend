import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MainPipesModule } from '@main-shared/main-pipes/main-pipes.module';
import { IconComponent } from './icon.component';

@NgModule({
    imports: [CommonModule, MainPipesModule],
    declarations: [IconComponent],
    exports: [IconComponent],
})
export class IconModule {}
