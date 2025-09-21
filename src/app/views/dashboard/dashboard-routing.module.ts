import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import $localize for localization support
import '@angular/localize/init';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      title: $localize`Dashboard`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
