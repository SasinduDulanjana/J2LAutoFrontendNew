import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicePageComponent } from './invoice-page.component';
import { InvoicePageRoutingModule } from './invoice-page-routing.module';

@NgModule({
  declarations: [InvoicePageComponent],
  imports: [
    CommonModule,
    InvoicePageRoutingModule
  ]
})
export class InvoicePageModule {}
