
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
  public totalDiscounts: number = 0;
  public netProfit: number = 0;

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
        this.totalDiscounts = data.totalDiscounts || 0;
        this.netProfit = data.netProfit || 0;
      },
      error: (err) => {
        this.totalSales = 0;
        this.totalPurchases = 0;
        this.totalDiscounts = 0;
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
        // Sort by INV_ID (saleID) descending and take the latest 8
        const mappedSales = (sales || []).map(sale => ({
          saleID: sale.invoiceNumber || sale.id,
          customer: sale.customer?.name || sale.customerName || sale.custName || sale.custId || '-',
          grandTotal: sale.totalAmount,
          paid: sale.paidAmount,
          due: (sale.totalAmount || 0) - (sale.paidAmount || 0)
        }));
        const sorted = mappedSales.sort((a, b) => {
          // If saleID is numeric, sort numerically; otherwise, lexically
          const aId = isNaN(Number(a.saleID)) ? a.saleID : Number(a.saleID);
          const bId = isNaN(Number(b.saleID)) ? b.saleID : Number(b.saleID);
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
