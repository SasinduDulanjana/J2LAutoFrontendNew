import { Component, OnInit } from '@angular/core';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-sales-return-list',
  templateUrl: './sales-return-list.component.html',
  styleUrls: ['./sales-return-list.component.scss']
})
export class SalesReturnListComponent implements OnInit {
  salesReturns: any[] = [];
  searchQuery: string = '';
  filteredSalesReturns: any[] = [];
  loading: boolean = false;

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loading = true;
    this.saleService.getAllSalesReturn().subscribe({
      next: (data) => {
        // Transform backend response to flat table rows
        this.salesReturns = (data || []).flatMap((sale: any) => {
          return (sale.returns || []).map((ret: any) => ({
            saleId: sale.saleId,
            invoiceNumber: sale.invoiceNumber || '',
            customerName: sale.customerName || '',
            returnDate: sale.returnDate || '',
            product: ret.productName || ret.product?.productName || ret.productId,
            batchNumber: ret.batchNumber || '',
            quantity: ret.quantityToReturn,
            condition: ret.condition,
            reason: ret.reason,
            refundAmount: ret.refundAmount || ''
          }));
        });
        this.filteredSalesReturns = this.salesReturns;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredSalesReturns = this.salesReturns;
      return;
    }
    this.filteredSalesReturns = this.salesReturns.filter(record =>
      (record.invoiceNumber && record.invoiceNumber.toString().toLowerCase().includes(query)) ||
      (record.customerName && record.customerName.toLowerCase().includes(query)) ||
      (record.product && record.product.toString().toLowerCase().includes(query))
    );
  }

  editSalesReturn(record: any): void {
    // Implement edit logic or navigation
    alert('Edit Sales Return: ' + record.invoiceNumber);
  }

  deleteSalesReturn(record: any): void {
    // Implement delete logic
    if (confirm('Are you sure you want to delete this sales return?')) {
      this.salesReturns = this.salesReturns.filter(r => r !== record);
      this.onSearch();
    }
  }
}
