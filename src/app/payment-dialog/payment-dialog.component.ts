import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  paymentAmount: number = 0; // Initialize payment amount
  paymentType: string = '';
  isConfirmDisabled: boolean = true;
  chequeNumber: string = '';
  bankName: string = '';
  chequeDate: string = '';

  public data: { maxAmount: number, paidAmount: number };
  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { maxAmount: number, paidAmount: number }
  ) {
    this.data = data;
  }

  closeDialog(): void {
    this.dialogRef.close(); // Close the dialog
  }

    // Check if the entered payment amount is valid
    checkAmount(): void {
      this.isConfirmDisabled = this.paymentAmount > this.data.maxAmount || this.paymentAmount <= 0;
    }
  
    confirmPayment(): void {
      if (!this.isConfirmDisabled) {
        const payload: any = {
          paymentAmount: this.paymentAmount,
          paymentType: this.paymentType
        };
        if (this.paymentType === 'Cheque') {
          payload.chequeNumber = this.chequeNumber;
          payload.bankName = this.bankName;
          payload.chequeDate = this.chequeDate;
        }
        this.dialogRef.close(payload);
      }
    }
}
