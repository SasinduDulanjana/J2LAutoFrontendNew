import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../services/expense.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.scss']
})
export class CreateExpenseComponent {
  expenseForm: FormGroup;
  submitted = false;
  loading = false;

    openPaymentDialog() {
      const expenseAmount = this.expenseForm.value.amount || 0;
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '400px',
        data: { maxAmount: expenseAmount, paidAmount: 0 }
      });
      dialogRef.afterClosed().subscribe((paymentResult: any) => {
        if (paymentResult) {
          this.loading = true;
          const expensePayload = {
            ...this.expenseForm.value,
            paidAmount: paymentResult.paymentAmount,
            paymentType: paymentResult.paymentType || '',
            chequeNumber: paymentResult.chequeNumber || '',
            bankName: paymentResult.bankName || '',
            chequeDate: paymentResult.chequeDate || '',
            isPaid: paymentResult.paymentAmount > 0
          };
          this.expenseService.saveExpense(expensePayload).subscribe({
            next: () => {
              this.dialog.open(SuccessDialogComponent, {
                data: { message: 'Expense saved successfully!' }
              });
              this.expenseForm.reset({
                expenseType: '',
                paymentMethod: '',
                description: '',
                amount: '',
                bankName: '',
                chequeDate: '',
                chequeNumber: '',
                reference: ''
              });
              this.submitted = false;
              this.loading = false;
            },
            error: () => {
              this.dialog.open(FailureDialogComponent, {
                data: { message: 'Failed to save expense.' }
              });
              this.loading = false;
            }
          });
        }
      });
    }

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private dialog: MatDialog
  ) {
    this.expenseForm = this.fb.group({
      expenseType: ['', Validators.required],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [''], // Optional now
      bankName: [''],
      chequeDate: [''],
      chequeNumber: [''],
      reference: ['']
    });

    this.expenseForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      const chequeFields = ['bankName', 'chequeDate', 'chequeNumber'];
      chequeFields.forEach(field => {
        const control = this.expenseForm.get(field);
        if (method === 'Cheque') {
          control?.setValidators(Validators.required);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.expenseForm.valid) {
      // Open payment dialog after entering expense details
      const expenseAmount = this.expenseForm.value.amount;
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '400px',
        data: { maxAmount: expenseAmount, paidAmount: 0 }
      });
      dialogRef.afterClosed().subscribe((paymentResult: any) => {
        if (paymentResult) {
          this.loading = true;
          // Merge payment info into expense payload
          const expensePayload = {
            ...this.expenseForm.value,
            paidAmount: paymentResult.paymentAmount,
            paymentType: paymentResult.paymentType || '',
            chequeNumber: paymentResult.chequeNumber || '',
            bankName: paymentResult.bankName || '',
            chequeDate: paymentResult.chequeDate || '',
            isPaid: paymentResult.paymentAmount > 0
          };
          this.expenseService.saveExpense(expensePayload).subscribe({
            next: () => {
              this.dialog.open(SuccessDialogComponent, {
                data: { message: 'Expense saved successfully!' }
              });
              this.expenseForm.reset({
                expenseType: '',
                paymentMethod: '',
                description: '',
                amount: '',
                bankName: '',
                chequeDate: '',
                chequeNumber: '',
                reference: ''
              });
              this.submitted = false;
              this.loading = false;
            },
            error: () => {
              this.dialog.open(FailureDialogComponent, {
                data: { message: 'Failed to save expense.' }
              });
              this.loading = false;
            }
          });
        }
      });
    }
  }
}
