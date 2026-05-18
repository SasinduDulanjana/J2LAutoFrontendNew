
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { SaleService } from '../../services/sale.service';
import { PurchaseService } from '../../services/purchase.service';
import { CustomerService } from '../../services/customer.service';
import { FinancialSummaryService } from '../../services/financial-summary.service';
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
  public monthlyChart: IChartProps = {};
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
    private financialSummaryService: FinancialSummaryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.fetchRecentSales();
    this.fetchFinancialSummary();
    this.fetchMonthlyFigures();
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

  fetchMonthlyFigures(): void {
    this.financialSummaryService.getMonthlyFigures().subscribe({
      next: (data: any[]) => {
        this.buildMonthlyChart(data);
      },
      error: (err) => {
        console.error('Error fetching monthly figures:', err);
        this.monthlyChart = {};
      }
    });
  }

  buildMonthlyChart(monthlyData: any): void {
    const brandInfo = '#20a8d8';
    const brandSuccess = '#4dbd74';
    const brandWarning = '#ffc107';

    // Extract data from API response
    const months: string[] = [];
    const salesData: number[] = [];
    const purchaseData: number[] = [];
    const profitData: number[] = [];

    // Handle both array and object response formats
    const dataArray = Array.isArray(monthlyData) ? monthlyData : monthlyData.data || [];

    // Sort data chronologically by date
    const sortedDataArray = dataArray.sort((a: any, b: any) => {
      const dateA = a.month || a.monthName || '';
      const dateB = b.month || b.monthName || '';
      
      // Try parsing as dates (YYYY-MM format)
      const dateAObj = new Date(dateA + '-01');
      const dateBObj = new Date(dateB + '-01');
      
      if (!isNaN(dateAObj.getTime()) && !isNaN(dateBObj.getTime())) {
        return dateAObj.getTime() - dateBObj.getTime();
      }
      
      // Fallback: compare as strings for month names
      const monthOrder = this.getMonthLabels();
      return monthOrder.indexOf(dateA) - monthOrder.indexOf(dateB);
    });

    sortedDataArray.forEach((item: any) => {
      months.push(item.month || item.monthName || '');
      salesData.push(item.sales || item.totalSales || 0);
      purchaseData.push(item.purchases || item.totalPurchases || 0);
      profitData.push(item.profit || item.netProfit || 0);
    });

    this.monthlyChart = {
      type: 'line',
      data: {
        labels: months.length > 0 ? months : this.getMonthLabels(),
        datasets: [
          {
            label: 'Sales',
            backgroundColor: 'transparent',
            borderColor: brandInfo,
            data: salesData.length > 0 ? salesData : this.getRandomData(12),
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: brandInfo,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4
          },
          {
            label: 'Purchases',
            backgroundColor: 'transparent',
            borderColor: brandWarning,
            data: purchaseData.length > 0 ? purchaseData : this.getRandomData(12),
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: brandWarning,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4
          },
          {
            label: 'Profit',
            backgroundColor: 'transparent',
            borderColor: brandSuccess,
            data: profitData.length > 0 ? profitData : this.getRandomData(12),
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: brandSuccess,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1,
            titleFont: {
              weight: 'bold',
              size: 12
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6c757d'
            },
            grid: {
              color: '#e9ecef'
            }
          },
          x: {
            ticks: {
              color: '#6c757d'
            },
            grid: {
              color: '#e9ecef'
            }
          }
        }
      }
    };
  }

  private getMonthLabels(): string[] {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  private getRandomData(count: number): number[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * 100000) + 10000);
    }
    return data;
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
        // Sort by saleDate descending (latest first)
        const parseCustomDate = (str: string) => {
          if (!str) return 0;
          // Expecting format 'DD-MM-YYYY HH:mm:ss' or ISO
          if (/\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/.test(str)) {
            const [datePart, timePart] = str.split(' ');
            const [day, month, year] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            return new Date(year, month - 1, day, hour, minute, second).getTime();
          }
          // Fallback to Date.parse
          return Date.parse(str);
        };
        const sorted = mappedSales.sort((a, b) => {
          const dateA = parseCustomDate(a.saleDate);
          const dateB = parseCustomDate(b.saleDate);
          return dateB - dateA;
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
