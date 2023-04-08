import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { CustomRoutes } from 'src/app/app-routing.module';
import { ScannerComponent } from './scanner/scanner.component';

const scannerRoutes: CustomRoutes = [
    {
        path: '',
        component: ScannerComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(scannerRoutes)],
    exports: [RouterModule],
})
export class ScannerRoutingModule {}
