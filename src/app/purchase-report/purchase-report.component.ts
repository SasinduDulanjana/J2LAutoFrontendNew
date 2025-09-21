
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Component } from '@angular/core';
import { PurchaseService } from '../services/purchase.service';
import { SupplierService } from '../services/supplier.service';
import { Supplier } from '../models/supplier.model';

@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss']
})
export class PurchaseReportComponent {
  purchases: any[] = [];
  filteredPurchases: any[] = [];
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  loading: boolean = false;
  error: string = '';
  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.filteredPurchases = this.purchases;
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Purchase Report', 14, 16);
    const head = [[
      'Date',
      'Invoice',
      'Supplier',
      'Total',
      'Paid',
      'Status'
    ]];
    const data = (this.purchases || []).map((purchase: any) => [
      purchase.invoiceDate ? formatDateForExport(purchase.invoiceDate) : '',
      purchase.invoiceNumber || '',
      purchase.supplierName || '',
      purchase.totalCost != null ? purchase.totalCost.toFixed(2) : '',
      purchase.paidAmount != null ? purchase.paidAmount.toFixed(2) : '',
      purchase.isFullyPaid ? 'Paid' : 'Unpaid'
    ]);

    function formatDateForExport(date: string): string {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    autoTable(doc, {
      head,
      body: data,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('purchase-report.pdf');
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredPurchases = this.purchases.filter(purchase =>
        (purchase.invoiceNumber && purchase.invoiceNumber.toLowerCase().includes(query)) ||
        (purchase.supplierName && purchase.supplierName.toLowerCase().includes(query))
      );
    } else {
      this.filteredPurchases = this.purchases;
    }
  }

  fetchPurchasesByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both start and end dates.';
      return;
    }
    this.error = '';
    this.loading = true;

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const formattedStart = formatDate(this.startDate);
    const formattedEnd = formatDate(this.endDate);

    this.purchaseService.getPurchasesByDateRange(formattedStart, formattedEnd).subscribe({
      next: (data: any[]) => {
        this.purchases = data;
        this.filteredPurchases = data;
        this.onSearch();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch purchases.';
        this.loading = false;
      }
    });
  }
}
