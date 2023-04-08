import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { JoinProjectRoutingModule } from './join-project-routing.module';
import { JoinProjectComponent } from './join-project.component';

@NgModule({
    declarations: [JoinProjectComponent],
    imports: [CommonModule, JoinProjectRoutingModule, TranslateModule],
})
export class JoinProjectModule {}
