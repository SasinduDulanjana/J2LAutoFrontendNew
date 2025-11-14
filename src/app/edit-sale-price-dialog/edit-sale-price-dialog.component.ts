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
    // Perform the backend update here so the dialog only closes after success.
    const saleId = this.data?.saleId;
    const product = this.data?.product || {};
    const productId = product?.product?.productId || product?.productId;
    const batchNumber = product?.batchNo || product?.batchNumber || '';

    const payload = {
      saleId: saleId,
      discountType: 'amount' as const,
      value: newD,
      productId,
      batchNumber,
      reason: this.reason || ''
    };

    // Validate saleId is present
    if (saleId === undefined || saleId === null) {
      this.error = 'Missing sale identifier; cannot apply discount.';
      return;
    }

    // Log payload for debugging and show any server error message to the user
    console.debug('Applying discount payload:', payload);
    this.loading = true;
    this.saleService.updateSaleDiscount(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // Close dialog and indicate success to caller
        this.dialogRef.close({ updated: true });
      },
      error: (err) => {
        this.loading = false;
        // Sometimes backend returns a textual success message but with a non-2xx status.
        // If we detect a success-like text, treat it as success and close the dialog.
        try {
          const possibleText = (err && err.text) || (err && err.error && (typeof err.error === 'string' ? err.error : err.error.text));
          if (possibleText && String(possibleText).toLowerCase().includes('success')) {
            console.warn('Backend returned success text in error response:', possibleText);
            this.dialogRef.close({ updated: true });
            return;
          }
        } catch (e) {
          console.error('Error checking server text for success:', e);
        }

        // Try to extract a useful message from the error response
        let msg = 'Failed to apply discount. Please try again.';
        try {
          if (err && err.error) {
            // If backend returns { message: '...' } or plain text
            if (typeof err.error === 'string') {
              msg = err.error;
            } else if ((err.error as any).message) {
              msg = (err.error as any).message;
            } else if ((err.error as any).text) {
              msg = (err.error as any).text;
            } else {
              msg = JSON.stringify(err.error);
            }
          } else if (err && err.message) {
            msg = err.message;
          } else if (err && err.statusText) {
            msg = err.statusText;
          }
        } catch (e) {
          console.error('Error extracting server error message', e);
        }
        console.error('Discount save failed:', err);
        this.error = msg;
      }
    });
  }
}
