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
      'Date',
      'Invoice',
      'Customer',
      'Total',
      'Paid',
      'Status'
    ]];
    const data = (this.sales || []).map((sale: any) => [
      sale.orderDate ? formatDateForExport(sale.orderDate) : (sale.saleDate || ''),
      sale.invoiceNumber || '',
      sale.customerName || sale.custId || '',
      sale.totalAmount != null ? sale.totalAmount.toFixed(2) : '',
      sale.paidAmount != null ? sale.paidAmount.toFixed(2) : '',
      sale.isFullyPaid ? 'Paid' : 'Unpaid'
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
    this.filteredSales = this.sales;
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSales = this.sales.filter(sale =>
        (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(query)) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(query)) ||
        (sale.custId && sale.custId.toString().includes(query))
      );
    } else {
      this.filteredSales = this.sales;
    }
  }

  fetchSalesByDateRange() {
    console.log('fetchSalesByDateRange called', this.startDate, this.endDate);
    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both start and end dates.';
      return;
    }
    this.error = '';
    this.loading = true;

    // Format dates as 'dd-MM-yyyy' for the API
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const formattedStart = formatDate(this.startDate);
    const formattedEnd = formatDate(this.endDate);
    console.log('Formatted dates:', formattedStart, formattedEnd);

    this.saleService.getSalesByDateRange(formattedStart, formattedEnd).subscribe({
      next: (data: any[]) => {
        console.log('Fetched sales data:', data);
        this.sales = data;
        this.filteredSales = data;
        this.onSearch();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch sales.';
        this.loading = false;
      }
    });
  }
}
