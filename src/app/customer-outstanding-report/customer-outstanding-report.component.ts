import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-customer-outstanding-report',
  templateUrl: './customer-outstanding-report.component.html',
  styleUrls: ['./customer-outstanding-report.component.scss']
})
export class CustomerOutstandingReportComponent implements OnInit {
  customerOptions: any[] = [];
  filteredCustomerOptions: any[] = [];
  customerSearchQuery: string = '';
  selectedCustomer: any;
  outstandingData: any;
  loading: boolean = false;
  activeTab: string = 'details';
  customerOutstanding: any[] = [];

  constructor(private route: ActivatedRoute, private customerService: CustomerService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const customerId = params.get('id');
      if (customerId) {
        this.selectedCustomer = customerId;
        this.onSearch();
      }
    });
  }
  onCustomerSearch() {
    const query = this.customerSearchQuery.trim();
    if (query) {
      this.customerService.searchCustomers(query).subscribe(data => {
        this.filteredCustomerOptions = data;
      });
    } else {
      this.filteredCustomerOptions = [];
    }
  }

  selectCustomer(customer: any) {
    this.customerSearchQuery = customer.name;
    this.selectedCustomer = customer.id ?? customer.custId;
    this.filteredCustomerOptions = [];
    this.onSearch(); // Call API and display details
  }

  // Optionally allow clearing selection for new search
  clearSelection() {
    this.selectedCustomer = null;
    this.customerSearchQuery = '';
    this.filteredCustomerOptions = this.customerOptions;
  }

  onSearch() {
    if (this.selectedCustomer) {
      this.loading = true;
      // Fetch transaction details (existing logic)
      this.customerService.getCustomerWithOutstanding(Number(this.selectedCustomer)).subscribe(data => {
        if (data && Array.isArray(data.transactionDetails)) {
          // Robust normalization for date strings
          data.transactionDetails = data.transactionDetails.map((txn: any) => {
            let parsedDate = txn.date;
            if (typeof parsedDate === 'string') {
              // yyyy-MM-dd HH:mm:ss → yyyy-MM-ddTHH:mm:ss
              if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(parsedDate)) {
                parsedDate = parsedDate.replace(' ', 'T');
              }
              // yyyy-MM-dd → yyyy-MM-ddT00:00:00
              else if (/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
                parsedDate = parsedDate + 'T00:00:00';
              }
              // else leave as is (assume ISO or already valid)
            }
            return { ...txn, date: parsedDate };
          }).sort((a: any, b: any) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          });
        }
        this.outstandingData = data;
        // Fetch outstanding tab data from new API
        this.customerService.getCustomerOutstanding(Number(this.selectedCustomer)).subscribe(outData => {
          this.customerOutstanding = Array.isArray(outData) ? outData : [];
          this.loading = false;
        }, err => {
          this.customerOutstanding = [];
          this.loading = false;
        });
      }, err => {
        this.loading = false;
      });
    }
  }

  exportToPDF(tab: string = this.activeTab): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Customer Outstanding Report', 14, 16);
    // Customer details
    if (this.outstandingData) {
      doc.setFontSize(12);
      doc.text(`Customer Name: ${this.outstandingData.customerName || '-'}`, 14, 26);
      doc.text(`Customer ID: ${this.outstandingData.customerId || '-'}`, 14, 33);
      doc.text(`Total Sales: ${this.outstandingData.totalSales != null ? this.outstandingData.totalSales : '-'}`, 14, 40);
      doc.text(`Total Returns: ${this.outstandingData.totalReturns != null ? this.outstandingData.totalReturns : '-'}`, 14, 47);
      doc.text(`Total Payments: ${this.outstandingData.totalPayments != null ? this.outstandingData.totalPayments : '-'}`, 14, 54);
      doc.text(`Outstanding: ${this.outstandingData.outstanding != null ? this.outstandingData.outstanding : '-'}`, 14, 61);
    }
    if (tab === 'details') {
      // Ledger Report (transaction details)
      const columns = [
        { header: 'Date & Time', dataKey: 'date' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Invoice No', dataKey: 'invoiceNo' },
        { header: 'Debit', dataKey: 'debit' },
        { header: 'Credit', dataKey: 'credit' },
        { header: 'Balance', dataKey: 'balance' },
        { header: 'Payment Method', dataKey: 'paymentMethod' },
        { header: 'Cheque No', dataKey: 'chequeNo' },
        { header: 'Cheque Date', dataKey: 'chequeDate' },
        { header: 'Payment Status', dataKey: 'paymentStatus' }
      ];
      const rows = (this.outstandingData?.transactionDetails || []).map((txn: any) => ({
        date: txn.date ? new Date(txn.date).toLocaleString() : '-',
        type: txn.type || '-',
        invoiceNo: txn.invoiceNo != null ? txn.invoiceNo : '-',
        debit: txn.debit != null ? txn.debit : '-',
        credit: txn.credit != null ? txn.credit : '-',
        balance: txn.balance != null ? txn.balance : '-',
        paymentMethod: txn.paymentMethod != null ? txn.paymentMethod : '-',
        chequeNo: txn.chequeNo != null ? txn.chequeNo : '-',
        chequeDate: txn.chequeDate != null ? txn.chequeDate : '-',
        paymentStatus: txn.paymentStatus != null ? txn.paymentStatus : '-'
      }));
      autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: rows.map((row: any) => [
          row.date,
          row.type,
          row.invoiceNo,
          row.debit,
          row.credit,
          row.balance,
          row.paymentMethod,
          row.chequeNo,
          row.chequeDate,
          row.paymentStatus
        ]),
        startY: 70,
        styles: { fontSize: 10 }
      });
      doc.save('customer-ledger-report.pdf');
    } else if (tab === 'outstanding') {
      // Outstanding Report
      const columns = [
        { header: 'Invoice No', dataKey: 'invoiceNumber' },
        { header: 'Purchase Date', dataKey: 'saleDate' },
        { header: 'Total Amount', dataKey: 'totalAmount' },
        { header: 'Paid Amount', dataKey: 'paidAmount' },
        { header: 'Outstanding', dataKey: 'outstanding' }
      ];
      const rows = (this.customerOutstanding || []).map((item: any) => ({
        invoiceNumber: item.invoiceNumber || '-',
        saleDate: item.saleDate || '-',
        totalAmount: item.totalAmount != null ? item.totalAmount : '-',
        paidAmount: item.paidAmount != null ? item.paidAmount : '-',
        outstanding: item.outstanding != null ? item.outstanding : '-'
      }));
      autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: rows.map((row: any) => [
          row.invoiceNumber,
          row.saleDate,
          row.totalAmount,
          row.paidAmount,
          row.outstanding
        ]),
        startY: 70,
        styles: { fontSize: 10 }
      });
      doc.save('customer-outstanding-report.pdf');
    }
  }

  exportExcel() {
    // Implement Excel export logic here
  }
}
