import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-edit-sale-price-dialog',
  templateUrl: './edit-sale-price-dialog.component.html',
  styleUrls: ['./edit-sale-price-dialog.component.scss']
})
export class EditSalePriceDialogComponent implements OnInit {
  newDiscount: number = 0;
  totalDiscount: number = 0;
  existingDiscount: number = 0;
  reason: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditSalePriceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    const product = this.data?.product || {};
    // Initialize discount values
    this.existingDiscount = Number(product.discountAmount || 0);
    this.newDiscount = 0;
    this.totalDiscount = this.existingDiscount + this.newDiscount;
  }

  cancel() {
    this.dialogRef.close({ updated: false });
  }

  save() {
    this.error = '';
    const newD = Number(this.newDiscount || 0);
    if (isNaN(newD) || newD < 0) {
      this.error = 'Please enter a valid non-negative discount amount.';
      return;
    }
    this.totalDiscount = this.existingDiscount + newD;
    // Close dialog and return discount info to caller; actual persistence should be done by caller/backend
    this.dialogRef.close({ updated: true, newDiscount: newD, totalDiscount: this.totalDiscount, reason: this.reason || '' });
  }
}
