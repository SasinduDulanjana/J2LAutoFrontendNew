
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BASE_URL } from '../base-url';

interface ProfitLossRow {
  month: string;
  sales: number;
  purchases: number;
  netProfit: number;
}

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  totalRevenue: number = 0;
  totalExpenses: number = 0;
  netProfit: number = 0;
  profitLossRows: ProfitLossRow[] = [];

  // Added for summary boxes
  totalPurchases: number = 0;
  totalSales: number = 0;
  dueToPay: number = 0;
  dueToReceive: number = 0;
  totalDiscounts: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch financial summary for summary boxes
  this.http.get<any>(BASE_URL + '/financialSummary/totalSummary').subscribe(summary => {
      this.totalPurchases = summary.totalPurchases ?? 0;
      this.totalSales = summary.totalSales ?? 0;
      this.totalDiscounts = summary.totalDiscounts ?? 0;
      this.dueToPay = summary.dueAmountToPay ?? 0;
      this.dueToReceive = summary.dueAmountToReceive ?? 0;
      this.netProfit = summary.netProfit ?? 0;
    });

    // Fetch monthly financial summary for table
  this.http.get<any[]>(BASE_URL + '/financialSummary/monthly').subscribe(monthlyRows => {
      this.profitLossRows = (monthlyRows || []).map(row => ({
        month: row.month,
        sales: row.sales ?? 0,
        purchases: row.purchases ?? 0,
        netProfit: row.netProfit ?? 0
      }));
      this.calculateSummary();
    });
  }

  calculateSummary(): void {
    this.totalRevenue = this.profitLossRows.reduce((sum, row) => sum + row.sales, 0);
    this.totalExpenses = this.profitLossRows.reduce((sum, row) => sum + row.purchases, 0);
    this.netProfit = this.profitLossRows.reduce((sum, row) => sum + row.netProfit, 0);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Profit and Loss Report', 14, 16);
    const head = [[
      'Month',
      'Sales',
      'Purchases',
      'Net Profit'
    ]];
    const data = (this.profitLossRows || []).map(row => [
      row.month,
      row.sales.toFixed(2),
      row.purchases.toFixed(2),
      row.netProfit.toFixed(2)
    ]);
    autoTable(doc, {
      head,
      body: data,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('profit-loss-report.pdf');
  }
}
