
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
  suppliers: any[] = [];
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  loading: boolean = false;
  error: string = '';
  constructor(private purchaseService: PurchaseService, private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.loading = true;
    this.supplierService.findAllSuppliers().subscribe({
      next: (suppliers: any[]) => {
        this.suppliers = suppliers;
        this.purchaseService.getAllPurchases().subscribe({
          next: (data: any[]) => {
            this.purchases = data.map(p => {
              const supId = p.supplierId ?? p.supId ?? null;
              return {
                ...p,
                supplierName: supId ? this.getSupplierName(supId) : ''
              };
            });
            this.filteredPurchases = this.purchases;
            this.loading = false;
          },
          error: err => {
            this.error = 'Failed to fetch purchases.';
            this.loading = false;
          }
        });
      },
      error: err => {
        this.error = 'Failed to fetch suppliers.';
        this.loading = false;
      }
    });
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find((s: any) => s.supId === supplierId);
    return supplier ? supplier.name : '';
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
    const data = (this.filteredPurchases || []).map((purchase: any) => [
      purchase.invoiceDate ? formatDateForExport(purchase.invoiceDate) : '',
      purchase.invoiceNumber || '',
      purchase.supplierName || '',
      purchase.totalCost != null ? purchase.totalCost.toFixed(2) : '',
      purchase.paidAmount != null ? purchase.paidAmount.toFixed(2) : '',
      purchase.isFullyPaid ? 'Paid' : 'Unpaid'
    ]);

    function formatDateForExport(date: string): string {
      // Parse 'dd-MM-yyyy HH:mm:ss' or 'dd-MM-yyyy'
      const [datePart] = date.split(' ');
      const [day, month, year] = datePart.split('-').map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
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
    let filtered = this.purchases;
    // Apply date filter if dates are selected
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(purchase => {
        // Parse invoiceDate in 'dd-MM-yyyy HH:mm:ss' or 'dd-MM-yyyy' format
        const dateStr = purchase.invoiceDate;
        if (!dateStr) return false;
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('-').map(Number);
        let hours = 0, minutes = 0, seconds = 0;
        if (timePart) {
          [hours, minutes, seconds] = timePart.split(':').map(Number);
        }
        const purchaseDate = new Date(year, month - 1, day, hours, minutes, seconds);
        return purchaseDate >= start && purchaseDate <= end;
      });
    }
    // Apply search filter
    if (query) {
      filtered = filtered.filter(purchase =>
        (purchase.invoiceNumber && purchase.invoiceNumber.toLowerCase().includes(query)) ||
        (purchase.supplierName && purchase.supplierName.toLowerCase().includes(query))
      );
    }
    this.filteredPurchases = filtered;
  }

  fetchPurchasesByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both start and end dates.';
      return;
    }
    this.error = '';
    this.onSearch();
  }
}
