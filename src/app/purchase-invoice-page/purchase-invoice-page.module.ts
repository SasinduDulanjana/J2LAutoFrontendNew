import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseInvoicePageComponent } from './purchase-invoice-page.component';
import { PurchaseInvoicePageRoutingModule } from './purchase-invoice-page-routing.module';

@NgModule({
  declarations: [PurchaseInvoicePageComponent],
  imports: [
    CommonModule,
    PurchaseInvoicePageRoutingModule
  ]
})
export class PurchaseInvoicePageModule {}
