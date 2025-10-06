
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { SaleService } from '../../services/sale.service';
import { PurchaseService } from '../../services/purchase.service';
import { CustomerService } from '../../services/customer.service';
import { BASE_URL } from '../../base-url';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  openProductListPopupForSale(sale: any, index: number): void {
    // TODO: Implement popup logic or navigation as needed
    console.log('Open product list for sale:', sale, index);
  }

  goToPaymentDetails(sale: any): void {
    // TODO: Implement payment details navigation or popup
    console.log('Go to payment details for sale:', sale);
  }
  public sales: any[] = [];
  public loading: boolean = true;
  // Removed customerMap, will use customer name from sale response
  public mainChart: IChartProps = {};
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new UntypedFormGroup({
    trafficRadio: new UntypedFormControl('Month')
  });
  public totalSales: number = 0;
  public totalPurchases: number = 0;
  public totalCogs: number = 0;
  public netProfit: number = 0;
  public totalExpenses: number = 0;

  constructor(
    private chartsData: DashboardChartsData,
    private saleService: SaleService,
    private customerService: CustomerService,
    private purchaseService: PurchaseService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
  this.initCharts();
  this.fetchRecentSales();
  this.fetchFinancialSummary();

  }

  fetchCustomersAndSales(): void {
  // Removed: No longer needed
  }

  fetchFinancialSummary(): void {
    // Fetch from backend API using Angular HttpClient
  this.http.get<any>(BASE_URL + '/financialSummary/totalSummary').subscribe({
      next: (data) => {
  this.totalSales = data.totalSales || 0;
  this.totalPurchases = data.totalPurchases || 0;
  this.totalCogs = data.totalCogs || 0;
  this.netProfit = data.netProfit || 0;
  this.totalExpenses = data.totalExpenses || data.totalCogs || 0;
      },
      error: (err) => {
        this.totalSales = 0;
        this.totalPurchases = 0;
        this.totalCogs = 0;
        this.netProfit = 0;
      }
    });
  }

  initCharts(): void {
    this.mainChart = this.chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.chartsData.initMainChart(value);
    this.initCharts();
  }

  fetchRecentSales(): void {
    this.loading = true;
    this.saleService.findAllSales().subscribe({
      next: (sales: any[]) => {
        // Map all fields needed for the dashboard table
        const mappedSales = (sales || []).map(sale => ({
          invoiceNumber: sale.invoiceNumber || sale.id,
          user: sale.user || { username: sale.username || '-' },
          customer: sale.customer || { name: sale.customerName || sale.custName || sale.custId || '-' },
          lineWiseDiscountTotalAmount: sale.lineWiseDiscountTotalAmount || 0,
          subTotal: sale.subTotal || sale.subtotal || 0,
          billWiseDiscountTotalAmount: sale.billWiseDiscountTotalAmount || 0,
          totalAmount: sale.totalAmount || 0,
          saleDate: sale.saleDate || sale.createdAt || sale.date || '-',
          outstandingBalance: sale.outstandingBalance || ((sale.totalAmount || 0) - (sale.paidAmount || 0)),
        }));
        const sorted = mappedSales.sort((a, b) => {
          // If invoiceNumber is numeric, sort numerically; otherwise, lexically
          const aId = isNaN(Number(a.invoiceNumber)) ? a.invoiceNumber : Number(a.invoiceNumber);
          const bId = isNaN(Number(b.invoiceNumber)) ? b.invoiceNumber : Number(b.invoiceNumber);
          if (aId < bId) return 1;
          if (aId > bId) return -1;
          return 0;
        });
        this.sales = sorted.slice(0, 8);
        this.loading = false;
      },
      error: () => {
        this.sales = [];
        this.loading = false;
      }
    });
  }
}
