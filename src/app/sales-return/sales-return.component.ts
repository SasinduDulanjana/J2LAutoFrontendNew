import { Component } from '@angular/core';
import { SaleService } from '../services/sale.service';
import { Sale } from '../models/sale.model';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss']
})
export class SalesReturnComponent {
  invoiceNumber: string = '';
  sale: Sale | null = null;
  error: string = '';
  loading: boolean = false;

  constructor(private saleService: SaleService) {}

  fetchSaleByInvoiceNumber() {
    this.error = '';
    this.sale = null;
    if (!this.invoiceNumber) {
      this.error = 'Please enter an invoice number.';
      return;
    }
    this.loading = true;
    this.saleService.findAllSales().subscribe({
      next: (sales: Sale[]) => {
        const found = sales.find(s => s.invoiceNumber === this.invoiceNumber);
        if (found) {
          this.sale = found;
        } else {
          this.error = 'No sale found for this invoice number.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error fetching sales.';
        this.loading = false;
      }
    });
  }
}
