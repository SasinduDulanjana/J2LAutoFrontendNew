import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Component } from '@angular/core';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-sale-report',
  templateUrl: './sale-report.component.html',
  styleUrls: ['./sale-report.component.scss']
})
export class SaleReportComponent {
  sales: any[] = [];
  filteredSales: any[] = [];
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  loading: boolean = false;
  error: string = '';

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Sale Report', 14, 16);
    const head = [[
      'Inv. No',
      'User',
      'Customer',
      // 'Line Discounts',
      'Sub Total',
      // 'Bill Discounts',
      'Net Total',
      'Created At',
      'Outstanding',
      'Paid'
    ]];
    const data = (this.filteredSales || []).map((sale: any) => [
      sale.invoiceNumber || '',
      sale.user?.username || '-',
      sale.customer?.name || '-',
      // sale.lineWiseDiscountTotalAmount != null ? sale.lineWiseDiscountTotalAmount : '',
      sale.subTotal != null ? sale.subTotal : '',
      // sale.billWiseDiscountTotalAmount != null ? sale.billWiseDiscountTotalAmount : '',
      sale.totalAmount != null ? sale.totalAmount : '',
      sale.saleDate || '',
      sale.outstandingBalance != null ? sale.outstandingBalance : '',
      sale.paidAmount != null ? sale.paidAmount.toFixed(2) : ''
    ]);

    // Helper to format orderDate for export (yyyy-MM-dd)
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
    doc.save('sale-report.pdf');
  }

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loading = true;
    this.saleService.findAllSales().subscribe({
      next: (data: any[]) => {
        this.sales = data;
        this.filteredSales = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch sales.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    let filtered = this.sales;
    // Apply date filter if dates are selected
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => {
        // Parse saleDate in 'dd-MM-yyyy HH:mm:ss' format
        const dateStr = (sale.orderDate || sale.saleDate);
        if (!dateStr) return false;
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('-').map(Number);
        let hours = 0, minutes = 0, seconds = 0;
        if (timePart) {
          [hours, minutes, seconds] = timePart.split(':').map(Number);
        }
        const saleDate = new Date(year, month - 1, day, hours, minutes, seconds);
        return saleDate >= start && saleDate <= end;
      });
    }
    // Apply search filter (case-insensitive, null-safe)
    if (query) {
      const includesQuery = (val: any) => {
        if (val === null || val === undefined) return false;
        return val.toString().toLowerCase().includes(query);
      };

      filtered = filtered.filter(sale =>
        includesQuery(sale.invoiceNumber) ||
        includesQuery(sale.user?.username) ||
        includesQuery(sale.customer?.name) ||
        includesQuery(sale.customerName) ||
        includesQuery(sale.custId) ||
        includesQuery(sale.customer?.mobile) ||
        includesQuery(sale.id)
      );
    }

    this.filteredSales = filtered;
  }

  fetchSalesByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both start and end dates.';
      return;
    }
    this.error = '';
    this.onSearch();
  }
}
