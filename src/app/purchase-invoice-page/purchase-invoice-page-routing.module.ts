import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseInvoicePageComponent } from './purchase-invoice-page.component';

const routes: Routes = [
  { path: '', component: PurchaseInvoicePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseInvoicePageRoutingModule {}
