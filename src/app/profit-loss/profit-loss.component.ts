
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BASE_URL } from '../base-url';

interface ProfitLossRow {
  month: string;
  sales: number;
  cogs: number;
  netProfit: number;
  expenses?: number;
}

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  filterYear: string = '';
  // ...existing code...
  // Filter fields
  filterMonth: string = '';
  filterSalesMin: number | null = null;
  filterSalesMax: number | null = null;
  filterCOGSMin: number | null = null;
  filterCOGSMax: number | null = null;
  filterNetProfitMin: number | null = null;
  filterNetProfitMax: number | null = null;

  get filteredRows(): ProfitLossRow[] {
    return this.profitLossRows.filter(row => {
      const yearMatch = !this.filterYear || row.month.includes(this.filterYear);
      const monthMatch = !this.filterMonth || row.month.toLowerCase().includes(this.filterMonth.toLowerCase());
      const salesMatch = (this.filterSalesMin === null || row.sales >= this.filterSalesMin) && (this.filterSalesMax === null || row.sales <= this.filterSalesMax);
      const cogsMatch = (this.filterCOGSMin === null || row.cogs >= this.filterCOGSMin) && (this.filterCOGSMax === null || row.cogs <= this.filterCOGSMax);
      const netProfitMatch = (this.filterNetProfitMin === null || row.netProfit >= this.filterNetProfitMin) && (this.filterNetProfitMax === null || row.netProfit <= this.filterNetProfitMax);
      return yearMatch && monthMatch && salesMatch && cogsMatch && netProfitMatch;
    });
  }
  totalRevenue: number = 0;
  totalExpenses: number = 0;
  netProfit: number = 0;
  profitLossRows: ProfitLossRow[] = [];

  // Added for summary boxes
  totalPurchases: number = 0;
  totalSales: number = 0;
  dueToPay: number = 0;
  dueToReceive: number = 0;
  totalCogs: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch financial summary for summary boxes
  this.http.get<any>(BASE_URL + '/financialSummary/totalSummary').subscribe(summary => {
      this.totalPurchases = summary.totalPurchases ?? 0;
      this.totalSales = summary.totalSales ?? 0;
      this.totalCogs = summary.totalCogs ?? 0;
      this.dueToPay = summary.dueAmountToPay ?? 0;
      this.dueToReceive = summary.dueAmountToReceive ?? 0;
      this.netProfit = summary.netProfit ?? 0;
    });

    // Fetch monthly financial summary for table
  this.http.get<any[]>(BASE_URL + '/financialSummary/monthly').subscribe(monthlyRows => {
      this.profitLossRows = (monthlyRows || []).map(row => ({
        month: row.month,
        sales: row.sales ?? 0,
        cogs: row.cogs ?? 0,
        netProfit: row.netProfit ?? 0,
        expenses: row.expenses ?? 0 // fallback to cogs if no expenses field
      }));
      this.calculateSummary();
    });
  }

  calculateSummary(): void {
    this.totalRevenue = this.profitLossRows.reduce((sum, row) => sum + row.sales, 0);
    this.totalExpenses = this.profitLossRows.reduce((sum, row) => sum + (row.expenses !== undefined ? row.expenses : row.cogs), 0);
    this.netProfit = this.profitLossRows.reduce((sum, row) => sum + row.netProfit, 0);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Profit and Loss Report', 14, 16);

    // Add summary cards to PDF
    doc.setFontSize(12);
    let y = 26;
    const summary = [
      ['Total Sales', this.totalSales],
      ['Total COGS', this.totalCogs],
      ['Net Profit', this.netProfit],
      ['Total Purchases', this.totalPurchases],
      ['Supplier Outstandings', this.dueToPay],
      ['Customer Outstandings', this.dueToReceive]
    ];
    summary.forEach(([label, value]) => {
      doc.text(`${label}: ${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 14, y);
      y += 8;
    });

    // Table
    const head = [[
      'Month',
      'Sales',
      'COGS',
      'Total Expenses',
      'Net Profit'
    ]];
    const data = (this.profitLossRows || []).map(row => [
      String(row.month ?? ''),
      row.sales !== undefined ? row.sales.toFixed(2) : '0.00',
      row.cogs !== undefined ? row.cogs.toFixed(2) : '0.00',
      (row.expenses !== undefined && row.expenses !== 0 ? row.expenses.toFixed(2) : (row.cogs !== undefined ? row.cogs.toFixed(2) : '0.00')),
      row.netProfit !== undefined ? row.netProfit.toFixed(2) : '0.00'
    ]);
    autoTable(doc, {
      head,
      body: data,
      startY: y + 2,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('profit-loss-report.pdf');
  }
}
