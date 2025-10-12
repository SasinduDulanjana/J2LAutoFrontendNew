import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-expense-payment-details',
  templateUrl: './expense-payment-details.component.html',
  styleUrls: ['./expense-payment-details.component.scss']
})
export class ExpensePaymentDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpensePaymentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { payments: any[], expense: any },
    private dialog: MatDialog,
    private expenseService: ExpenseService
  ) {}

  close(): void {
    this.dialogRef.close();
  }
  
    pay(): void {
      const dueAmount = this.getDueAmount();
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '400px',
        data: { maxAmount: dueAmount, paidAmount: 0 }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result && result.paymentAmount > 0) {
          // Build payload for backend
          const payload = {
            expenseId: this.data.expense.id,
            amount: result.paymentAmount,
            paymentMethod: result.paymentType,
            chequeNo: result.chequeNumber || '',
            bankName: result.bankName || '',
            chequeDate: result.chequeDate || '',
          };
          this.expenseService.updateExpensePaymentAmount(payload).subscribe(() => {
            // Refresh payment details after successful payment
            this.expenseService.getPaymentDetailsOfExpense(this.data.expense.id).subscribe((payments: any[]) => {
              this.data.payments = payments;
            });
          });
        }
      });
    }
  
    getDueAmount(): number {
      const totalAmount = this.data.payments[0]?.payment?.totalAmount || 0;
      const paidSum = this.data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return totalAmount - paidSum;
    }
}
