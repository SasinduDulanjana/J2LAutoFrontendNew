import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  exportToPDF() {
    const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Payment History', 14, 16);
  // Add sale info as headings
  doc.setFontSize(12);
  doc.text(`Invoice No: ${this.sale?.invoiceNumber || '-'}`, 14, 26);
  doc.text(`Customer: ${this.sale?.customer?.name || '-'}`, 14, 33);
  doc.text(`Net Total: ${this.sale?.totalAmount != null ? this.sale.totalAmount : '-'}`, 14, 40);
  doc.text(`Paid Amount: ${this.sale?.paidAmount != null ? this.sale.paidAmount : '-'}`, 14, 47);
    const columns = [
      { header: 'Date & Time', dataKey: 'date' },
      { header: 'Method', dataKey: 'method' },
      { header: 'Cheque No', dataKey: 'chequeNo' },
      { header: 'Bank Name', dataKey: 'bankName' },
      { header: 'Cheque Date', dataKey: 'chequeDate' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Payment Status', dataKey: 'status' }
    ];
    const rows = this.paymentHistory.map((p: any) => ({
      date: p.date ? new Date(p.date).toLocaleString() : '-',
      method: p.method || '-',
      chequeNo: p.chequeNo || '-',
      bankName: p.bankName || '-',
      chequeDate: p.chequeDate || '-',
      amount: p.amount != null ? p.amount : '-',
      status: p.status || '-'
    }));
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: rows.map((row: any) => [
        row.date,
        row.method,
        row.chequeNo,
        row.bankName,
        row.chequeDate,
        row.amount,
        row.status
      ]),
      startY: 54,
      styles: { fontSize: 10 }
    });
    doc.save('payment-history.pdf');
  }
  invoiceNumber!: string;
  sale: any = null;
  paymentHistory: any[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private saleService: SaleService,
    private dialog: MatDialog
  ) {}

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
                this.paymentHistory = data
                  .map((item: any) => ({
                    date: item.paymentDate || item.payment?.paymentDate,
                    chequeNo: item.chequeNo,
                    bankName: item.bankName,
                    chequeDate: item.chequeDate,
                    amount: item.amount,
                    status: item.paymentStatus || item.payment?.status || 'Unknown',
                    method: item.paymentMethod,
                    payment: item.payment // Preserve full payment object for paymentId access
                  }))
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateA - dateB;
                  });
            } else {
              // No payments, fetch sale info separately
              this.saleService.getSaleByInvoiceNumber(this.invoiceNumber).subscribe(
                (saleData: any) => {
                  this.sale = {
                    invoiceNumber: saleData.invoiceNumber || '',
                    customer: saleData.customer || { name: '' },
                    totalAmount: saleData.totalAmount || 0,
                    paidAmount: saleData.paidAmount || 0
                  };
                  this.paymentHistory = [];
                  this.loading = false;
                },
                error => {
                  this.sale = {
                    invoiceNumber: this.invoiceNumber,
                    customer: { name: '' },
                    totalAmount: 0,
                    paidAmount: 0
                  };
                  this.paymentHistory = [];
                  this.loading = false;
                }
              );
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
    if (!this.sale) return;
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: {
        maxAmount: this.sale.totalAmount - this.sale.paidAmount,
        paidAmount: this.sale.paidAmount
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Build payload for API
        let paymentId = 0;
        const proceedWithPayment = (paymentId: number) => {
          const payload = {
            paymentId: paymentId,
            method: result.paymentType,
            amount: result.paymentAmount,
            chequeNo: result.chequeNumber || null,
            bankName: result.bankName || null,
            chequeDate: result.chequeDate || null,
          };
          this.saleService.createPaymentDetails(payload).subscribe(
            (resp: any) => {
              console.log('Payment created:', resp);
              // Refresh payment history after successful payment
              this.loading = true;
              this.saleService.getPaymentsByInvoiceNumber(this.invoiceNumber).subscribe(
                (data: any) => {
                  if (Array.isArray(data) && data.length > 0) {
                    const first = data[0];
                    this.sale = {
                      invoiceNumber: first.payment.referenceId || '',
                      customer: first.payment.customer || { name: '' },
                      totalAmount: first.payment.totalAmount || 0,
                      paidAmount: data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
                    };
                    this.paymentHistory = data
                      .map((item: any) => ({
                        date: item.paymentDate || item.payment?.paymentDate,
                        chequeNo: item.chequeNo,
                        bankName: item.bankName,
                        chequeDate: item.chequeDate,
                        amount: item.amount,
                        status: item.paymentStatus || item.payment?.status || 'Unknown',
                        method: item.paymentMethod,
                        payment: item.payment
                      }))
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.date).getTime();
                        const dateB = new Date(b.date).getTime();
                        return dateA - dateB;
                      });
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
            },
            (err: any) => {
              console.error('Payment creation failed:', err);
            }
          );
        };
        if (this.paymentHistory.length > 0 && this.paymentHistory[this.paymentHistory.length - 1].payment && this.paymentHistory[this.paymentHistory.length - 1].payment.paymentId) {
          paymentId = this.paymentHistory[this.paymentHistory.length - 1].payment.paymentId;
          proceedWithPayment(paymentId);
        } else {
          // Fetch paymentId using new API if no payment details exist
          this.saleService.fetchPaymentByInvoiceNumber(this.invoiceNumber).subscribe(
            (resp: any) => {
              paymentId = resp?.paymentId || 0;
              proceedWithPayment(paymentId);
            },
            (err) => {
              proceedWithPayment(0);
            }
          );
        }
      }
    });
  }
}
