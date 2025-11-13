import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../services/purchase.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-purchase-payment-details',
  templateUrl: './purchase-payment-details.component.html',
  styleUrls: ['./purchase-payment-details.component.scss']
})
export class PurchasePaymentDetailsComponent implements OnInit {
  purchase: any = null;
  paymentHistory: any[] = [];
  loading: boolean = false;
  purchaseId!: number;

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.purchaseId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.purchaseId) {
      this.loading = true;
      this.purchaseService.getPaymentDetailsByPurchaseId(this.purchaseId).subscribe({
        next: (response: any[]) => {
          if (Array.isArray(response) && response.length > 0) {
            const first = response[0];
            const payment = first.payment || {};
            const supplier = payment.supplier || {};
            this.purchase = {
              purchaseId: payment.referenceId || '-',
              invoiceNumber: payment.remarks || '-',
              supplierName: supplier.name || '-',
              totalCost: payment.totalAmount || 0,
              paidAmount: response.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
              paymentStatus: first.paymentStatus || payment.paymentStatus || '-',
            };
            // initialize returnAmount and outstanding, then update by fetching purchase returns
            this.purchase.returnAmount = 0;
            this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0);
            this.updateReturnAmounts();
            this.paymentHistory = response.map((item: any) => ({
              date: item.paymentDate || (item.payment && item.payment.paymentDate) || '',
              chequeNo: item.chequeNo,
              bankName: item.bankName,
              chequeDate: item.chequeDate,
              amount: item.amount,
              status: item.paymentStatus || (item.payment && item.payment.paymentStatus) || 'Unknown',
              method: item.paymentMethod || '-',
              payment: item.payment
            }));
            this.loading = false;
          } else {
            // No payment details, fetch purchase info
            this.purchaseService.getPurchaseById(this.purchaseId).subscribe({
              next: (purchase: any) => {
                this.purchase = {
                  purchaseId: purchase.purchaseId || '-',
                  invoiceNumber: purchase.invoiceNumber || '-',
                  supplierName: purchase.supplierName || '-',
                  totalCost: purchase.totalCost || 0,
                  paidAmount: 0,
                  paymentStatus: '-',
                };
                this.purchase.returnAmount = 0;
                this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0);
                this.updateReturnAmounts();
                this.paymentHistory = [];
                this.loading = false;
              },
              error: () => {
                this.purchase = {
                  purchaseId: '-',
                  invoiceNumber: '-',
                  supplierName: '-',
                  totalCost: 0,
                  paidAmount: 0,
                  paymentStatus: '-',
                };
                this.paymentHistory = [];
                this.loading = false;
              }
            });
          }
        },
        error: () => {
          this.purchase = {
            purchaseId: '-',
            invoiceNumber: '-',
            supplierName: '-',
            totalCost: 0,
            paidAmount: 0,
            paymentStatus: '-',
          };
          this.paymentHistory = [];
          this.loading = false;
        }
      });
    }
  }

  // Compute total returned amount for this purchase and update outstanding
  private updateReturnAmounts(): void {
    if (!this.purchase) return;
    this.purchase.returnAmount = 0;
    this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0);
    this.purchaseService.getPurchaseReturns().subscribe({
      next: (data: any[]) => {
        try {
          console.log('getPurchaseReturns response:', data);
          // data is an array of purchase return entries; each may have purchaseId or invoiceNumber and returns array
          const flattened = (data || []).flatMap((pr: any) => {
            const inv = pr.invoiceNumber || pr.invoiceNo || '';
            const pid = pr.purchaseId || pr.purchase_id || pr.purchaseId;
            return (pr.returns || []).map((r: any) => ({ purchaseId: pid, invoiceNumber: inv, refundAmount: Number(r.refundAmount ?? r.refundedAmount ?? 0) }));
          });
          console.log('Flattened purchase returns:', flattened);
          const sum = flattened
            .filter((r: any) => {
              // Match by purchaseId if available, else by invoiceNumber
              const matchById = this.purchase.purchaseId && r.purchaseId && Number(r.purchaseId) === Number(this.purchase.purchaseId);
              const matchByInv = this.purchase.invoiceNumber && r.invoiceNumber && String(r.invoiceNumber) === String(this.purchase.invoiceNumber);
              if (matchById || matchByInv) console.log('Matched return row for purchase:', r);
              return matchById || matchByInv;
            })
            .reduce((acc: number, cur: any) => acc + (Number(cur.refundAmount) || 0), 0);
          console.log('Computed return sum:', sum, 'for purchase', this.purchase);
          this.purchase.returnAmount = sum;
          this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0) - (this.purchase.returnAmount || 0);
        } catch (e) {
          this.purchase.returnAmount = 0;
          this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0);
        }
      },
      error: () => {
        this.purchase.returnAmount = 0;
        this.purchase.outstanding = (this.purchase.totalCost || 0) - (this.purchase.paidAmount || 0);
      }
    });
  }

  payBalance() {
    if (!this.purchase) return;
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: {
        maxAmount: this.purchase.totalCost - this.purchase.paidAmount,
        paidAmount: this.purchase.paidAmount
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const setPaymentAndProceed = (paymentId: number | null) => {
          const payload = {
            paymentId: paymentId ?? 0,
            method: result.paymentType,
            amount: result.paymentAmount,
            chequeNo: result.chequeNumber || '',
            bankName: result.bankName || '',
            chequeDate: result.chequeDate || ''
          };
          this.loading = true;
          this.purchaseService.createPaymentDetails(payload).subscribe({
            next: () => {
              // Refresh payment details after successful payment
              this.purchaseService.getPaymentDetailsByPurchaseId(this.purchaseId).subscribe({
                next: (response: any[]) => {
                  if (Array.isArray(response) && response.length > 0) {
                    const first = response[0];
                    const payment = first.payment || {};
                    const supplier = payment.supplier || {};
                    this.purchase = {
                      invoiceNumber: payment.remarks || '-',
                      supplierName: supplier.name || '-',
                      totalCost: payment.totalAmount || 0,
                      paidAmount: response.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
                      paymentStatus: first.paymentStatus || payment.paymentStatus || '-',
                    };
                  // refresh return amount/outstanding after updating payments
                  this.purchase.returnAmount = this.purchase.returnAmount || 0;
                  this.updateReturnAmounts();
                  } else {
                    this.purchase = null;
                  }
                  this.paymentHistory = Array.isArray(response)
                    ? response.map((item: any) => ({
                        date: item.paymentDate || (item.payment && item.payment.paymentDate) || '',
                        chequeNo: item.chequeNo,
                        bankName: item.bankName,
                        chequeDate: item.chequeDate,
                        amount: item.amount,
                        status: item.paymentStatus || (item.payment && item.payment.paymentStatus) || 'Unknown',
                        method: item.paymentMethod || '-',
                        payment: item.payment
                      }))
                    : [];
                  this.loading = false;
                },
                error: () => {
                  this.purchase = null;
                  this.paymentHistory = [];
                  this.loading = false;
                }
              });
            },
            error: () => {
              this.loading = false;
            }
          });
        };
        // If payment history exists, use last paymentId; else fetch using API
        if (this.paymentHistory.length > 0 && this.paymentHistory[this.paymentHistory.length - 1].payment && this.paymentHistory[this.paymentHistory.length - 1].payment.paymentId) {
          setPaymentAndProceed(this.paymentHistory[this.paymentHistory.length - 1].payment.paymentId);
        } else {
          this.purchaseService.fetchPaymentByPurchaseId(this.purchaseId).subscribe({
            next: (resp: any) => {
              setPaymentAndProceed(resp?.paymentId || null);
            },
            error: () => {
              setPaymentAndProceed(null);
            }
          });
        }
      }
    });
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Purchase Payment Details', 14, 16);
    doc.setFontSize(12);
    doc.text(`Invoice No: ${this.purchase?.invoiceNumber || '-'}`, 14, 26);
    doc.text(`Supplier: ${this.purchase?.supplierName || '-'}`, 14, 33);
    doc.text(`Total Cost: ${this.purchase?.totalCost != null ? this.purchase.totalCost : '-'}`, 14, 40);
    doc.text(`Paid Amount: ${this.purchase?.paidAmount != null ? this.purchase.paidAmount : '-'}`, 14, 47);
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
    doc.save('purchase-payment-details.pdf');
  }
}
