
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchasePaymentDetailsComponent } from './purchase-payment-details.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  { path: '', component: PurchasePaymentDetailsComponent }
];

@NgModule({
  declarations: [PurchasePaymentDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatIconModule
  ],
  exports: [PurchasePaymentDetailsComponent]
})
export class PurchasePaymentDetailsModule {}
