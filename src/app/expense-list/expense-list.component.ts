import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { MatDialog } from '@angular/material/dialog';
import { ExpensePaymentDetailsComponent } from '../expense-payment-details/expense-payment-details.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  filteredExpenses: any[] = [];
  loading = false;

  // Filter fields
  filterFromDate: string = '';
  filterToDate: string = '';
  filterExpenseType: string = '';
  filterPaymentMethod: string = '';
  filterSearch: string = '';

  expenseTypes: string[] = [
    'Transport', 'Courier', 'Sale Commision', 'Purchase Commision', 'Misc'
  ];
  get visibleExpenseTypes(): string[] {
    return this.expenseTypes.filter(type => type !== 'Misc');
  }
  paymentMethods: string[] = [
    'Cash', 'Bank', 'Cheque', 'Card', 'Bank Transfer'
  ];

  constructor(private expenseService: ExpenseService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loading = true;
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      // Date range filter
      const expenseDate = expense.date ? new Date(expense.date) : null;
      const fromDate = this.filterFromDate ? new Date(this.filterFromDate) : null;
      const toDate = this.filterToDate ? new Date(this.filterToDate) : null;
      if (fromDate && expenseDate && expenseDate < fromDate) return false;
      if (toDate && expenseDate && expenseDate > toDate) return false;

      // Expense type filter
      if (this.filterExpenseType && expense.expenseType !== this.filterExpenseType) return false;

      // Payment method filter
      if (this.filterPaymentMethod && expense.paymentMethod !== this.filterPaymentMethod) return false;

      // Search filter (description or reference)
      const search = this.filterSearch.trim().toLowerCase();
      if (search) {
        const desc = (expense.description || '').toLowerCase();
        const ref = (expense.reference || '').toLowerCase();
        if (!desc.includes(search) && !ref.includes(search)) return false;
      }

      return true;
    });
    // Sort by id descending (latest first)
    this.filteredExpenses.sort((a, b) => {
      return (b.id || 0) - (a.id || 0);
    });
  }

  getTotalExpenses(): number {
    return this.filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }

  getTotalByType(type: string): number {
    return this.filteredExpenses
      .filter(exp => exp.expenseType === type)
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }


    getTotalDueAmount(): number {
      return this.filteredExpenses.reduce((sum, exp) => sum + (Number(exp.dueAmount) || 0), 0);
    }
  clearFilters(): void {
    this.filterFromDate = '';
    this.filterToDate = '';
    this.filterExpenseType = '';
    this.filterPaymentMethod = '';
    this.filterSearch = '';
    this.applyFilters();
  }
  
    payExpense(expense: any): void {
      // Open payment dialog for the selected expense
      // You may need to import MatDialog and PaymentDialogComponent
      // Example implementation:
      // const dialogRef = this.dialog.open(PaymentDialogComponent, {
      //   width: '400px',
      //   data: { maxAmount: expense.dueAmount, paidAmount: expense.paidAmount }
      // });
      // dialogRef.afterClosed().subscribe((paymentResult: any) => {
      //   if (paymentResult) {
      //     // Call API to update payment for this expense
      //     this.expenseService.payExpense(expense.id, paymentResult).subscribe(() => {
      //       // Optionally refresh list or show success
      //     });
      //   }
      // });
      alert('Pay button clicked for expense ID: ' + expense.id);
    }
  
    openPaymentDetails(expense: any): void {
      this.expenseService.getPaymentDetailsOfExpense(expense.id).subscribe((payments: any[]) => {
        const dialogRef = this.dialog.open(ExpensePaymentDetailsComponent, {
          width: '600px',
          data: { payments, expense },
          disableClose: false
        });
        dialogRef.afterClosed().subscribe(() => {
          // Refresh expenses after closing popup
          this.loading = true;
          this.expenseService.getExpenses().subscribe({
            next: (data) => {
              this.expenses = data;
              this.applyFilters();
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        });
      });
    }
}
