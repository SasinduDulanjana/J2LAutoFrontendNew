import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sales-return-list',
  templateUrl: './sales-return-list.component.html',
  styleUrls: ['./sales-return-list.component.scss']
})
export class SalesReturnListComponent implements OnInit {
  salesReturns: any[] = [
    {
      invoiceNumber: 'INV-001',
      customerName: 'John Doe',
      returnDate: '2025-08-10',
      product: 'Product A',
      quantity: 2,
      reason: 'Damaged',
      refundAmount: 100
    },
    {
      invoiceNumber: 'INV-002',
      customerName: 'Jane Smith',
      returnDate: '2025-08-11',
      product: 'Product B',
      quantity: 1,
      reason: 'Expired',
      refundAmount: 50
    }
  ];

  searchQuery: string = '';
  filteredSalesReturns: any[] = [];

  ngOnInit(): void {
    this.filteredSalesReturns = this.salesReturns;
  }

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredSalesReturns = this.salesReturns;
      return;
    }
    this.filteredSalesReturns = this.salesReturns.filter(record =>
      record.invoiceNumber.toLowerCase().includes(query) ||
      record.customerName.toLowerCase().includes(query) ||
      record.product.toLowerCase().includes(query)
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
