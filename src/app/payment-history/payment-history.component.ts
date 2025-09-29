import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  exportToPDF() {
    // TODO: Implement PDF export logic
    alert('Export to PDF clicked!');
  }
  invoiceNumber!: string;
  sale: any = null;
  paymentHistory: any[] = [];
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private saleService: SaleService) {}

  ngOnInit(): void {
    this.invoiceNumber = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
        this.saleService.getPaymentsByInvoiceNumber(this.invoiceNumber).subscribe(
          (data: any) => {
            console.log('Payment details response:', data);
            // Map sale info from first payment if available
            if (Array.isArray(data) && data.length > 0) {
              const first = data[0];
              this.sale = {
                invoiceNumber: first.payment.referenceId || '',
                customer: first.payment.customer || { name: '' },
                totalAmount: first.payment.totalAmount || 0,
                paidAmount: data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
              };
              this.paymentHistory = data.map((item: any) => ({
                date: item.payment.paymentDate,
                chequeNo: item.chequeNo,
                bankName: item.bankName,
                chequeDate: item.chequeDate,
                amount: item.amount,
                status: item.paymentStatus || item.payment.status || 'Unknown',
                method: item.paymentMethod
              }));
            } else {
              this.sale = null;
              this.paymentHistory = [];
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.sale = null;
            this.paymentHistory = [];
          }
        );
  }

  payBalance() {
    // TODO: Implement payment logic or open payment dialog
    alert('Pay Balance clicked!');
  }
}
