import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bill-dialog',
  template: `
    <app-bill
      [invoiceNumber]="data.invoiceNumber"
      [currentDate]="data.currentDate"
      [selectedCustomerName]="data.selectedCustomerName"
      [loggedUserName]="data.loggedUserName"
      [saleItems]="data.saleItems"
      [billWiseDiscountPercentage]="data.billWiseDiscountPercentage"
      [saleItem]="data.saleItem"
      [getSubtotal]="data.getSubtotal"
      [getTotalDiscount]="data.getTotalDiscount"
      [getTotalBillWiseDiscount]="data.getTotalBillWiseDiscount"
      [getTotal]="data.getTotal"
    ></app-bill>
  `
})
export class BillDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
