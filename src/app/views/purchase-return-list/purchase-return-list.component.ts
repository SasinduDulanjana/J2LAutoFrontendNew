import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.scss']
})
export class PurchaseReturnListComponent implements OnInit {
  purchaseReturns: any[] = [];
  loading = false;
  filteredPurchaseReturns: any[] = [];
  searchQuery = '';

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.fetchPurchaseReturns();
  }

  fetchPurchaseReturns(): void {
    this.loading = true;
    this.purchaseService.getPurchaseReturns().subscribe({
      next: (data: any[]) => {
        this.purchaseReturns = data || [];
        this.filteredPurchaseReturns = [...this.purchaseReturns];
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
      this.filteredPurchaseReturns = [...this.purchaseReturns];
      return;
    }
    this.filteredPurchaseReturns = this.purchaseReturns.filter(record => {
      // Check top-level fields
      const topMatch = (record.invoiceNumber?.toLowerCase().includes(query) ||
        record.purchaseId?.toString().toLowerCase().includes(query) ||
        record.supplierName?.toLowerCase().includes(query) ||
        record.returnDate?.toLowerCase().includes(query));
      // Check all returned items
  const returnsMatch = Array.isArray(record.returns) && record.returns.some((ret: any) =>
        ret.productName?.toLowerCase().includes(query) ||
        ret.batchNumber?.toLowerCase().includes(query) ||
        ret.reason?.toLowerCase().includes(query) ||
        (ret.refundAmount != null && ret.refundAmount.toString().toLowerCase().includes(query))
      );
      return topMatch || returnsMatch;
    });
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
