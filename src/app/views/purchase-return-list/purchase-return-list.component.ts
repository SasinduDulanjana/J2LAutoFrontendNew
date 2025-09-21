import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.scss']
})
export class PurchaseReturnListComponent {
  purchaseReturns = [
    {
      returnNumber: 'PR-001',
      supplierName: 'Supplier A',
      returnDate: '2025-08-01',
      product: 'Product X',
      quantity: 10,
      reason: 'Damaged',
      refundAmount: 100
    },
    {
      returnNumber: 'PR-002',
      supplierName: 'Supplier B',
      returnDate: '2025-08-05',
      product: 'Product Y',
      quantity: 5,
      reason: 'Expired',
      refundAmount: 50
    }
  ];

  filteredPurchaseReturns = [...this.purchaseReturns];
  searchQuery = '';

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredPurchaseReturns = [...this.purchaseReturns];
      return;
    }
    this.filteredPurchaseReturns = this.purchaseReturns.filter(record =>
      record.returnNumber.toLowerCase().includes(query) ||
      record.supplierName.toLowerCase().includes(query) ||
      record.product.toLowerCase().includes(query)
    );
  }

  editPurchaseReturn(record: any): void {
    // Implement edit logic or open dialog
    alert('Edit Purchase Return: ' + record.returnNumber);
  }

  deletePurchaseReturn(record: any): void {
    if (confirm('Are you sure you want to delete this purchase return?')) {
      this.purchaseReturns = this.purchaseReturns.filter(r => r !== record);
      this.onSearch();
    }
  }
}
