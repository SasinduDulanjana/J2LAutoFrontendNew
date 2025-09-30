import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';
import { SupplierService } from '../services/supplier.service';

@Component({
  selector: 'app-supplier-outstanding-report',
  templateUrl: './supplier-outstanding-report.component.html',
  styleUrls: ['./supplier-outstanding-report.component.scss']
})
export class SupplierOutstandingReportComponent implements OnInit {
  supplierOptions: any[] = [];
  filteredSupplierOptions: any[] = [];
  supplierSearchQuery: string = '';
  selectedSupplier: any;
  outstandingData: any;
  loading: boolean = false;
  activeTab: string = 'details';
  supplierOutstanding: any[] = [];

  constructor(private route: ActivatedRoute, private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const supplierId = params.get('id');
      if (supplierId) {
        this.selectedSupplier = supplierId;
        this.onSearch();
      }
    });
  }
  onSupplierSearch() {
    const query = this.supplierSearchQuery.trim();
    if (query) {
      this.supplierService.searchSuppliers(query).subscribe(data => {
        this.filteredSupplierOptions = data;
      });
    } else {
      this.filteredSupplierOptions = [];
    }
  }

  selectSupplier(supplier: any) {
    this.supplierSearchQuery = supplier.name;
    this.selectedSupplier = supplier.id ?? supplier.suppId;
    this.filteredSupplierOptions = [];
    this.onSearch(); // Call API and display details
  }

  clearSelection() {
    this.selectedSupplier = null;
    this.supplierSearchQuery = '';
    this.filteredSupplierOptions = this.supplierOptions;
  }

  onSearch() {
    if (this.selectedSupplier) {
      this.loading = true;
      // Fetch main supplier report
      this.supplierService.getSupplierWithOutstanding(Number(this.selectedSupplier)).subscribe(data => {
        if (data && Array.isArray(data.transactionDetails)) {
          data.transactionDetails = data.transactionDetails.map((txn: any) => {
            let parsedDate = txn.date;
            if (typeof parsedDate === 'string') {
              if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(parsedDate)) {
                parsedDate = parsedDate.replace(' ', 'T');
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
                parsedDate = parsedDate + 'T00:00:00';
              }
            }
            return { ...txn, date: parsedDate };
          }).sort((a: any, b: any) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          });
        }
        this.outstandingData = data;
        this.loading = false;
      }, err => {
        this.loading = false;
      });

      // Fetch outstanding tab data from new API
      this.supplierService.getSupplierOutstanding(Number(this.selectedSupplier)).subscribe(outData => {
        if (Array.isArray(outData)) {
          this.supplierOutstanding = outData;
        } else {
          this.supplierOutstanding = [];
        }
      }, err => {
        this.supplierOutstanding = [];
      });
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Supplier Outstanding Report', 14, 16);
    if (this.outstandingData) {
      doc.setFontSize(12);
      doc.text(`Supplier Name: ${this.outstandingData.supplierName || '-'}`, 14, 26);
      doc.text(`Supplier ID: ${this.outstandingData.supplierId || '-'}`, 14, 33);
      doc.text(`Total Purchases: ${this.outstandingData.totalPurchases != null ? this.outstandingData.totalPurchases : '-'}`, 14, 40);
      doc.text(`Total Returns: ${this.outstandingData.totalReturns != null ? this.outstandingData.totalReturns : '-'}`, 14, 47);
      doc.text(`Total Payments: ${this.outstandingData.totalPayments != null ? this.outstandingData.totalPayments : '-'}`, 14, 54);
      doc.text(`Outstanding: ${this.outstandingData.outstanding != null ? this.outstandingData.outstanding : '-'}`, 14, 61);
    }
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
    doc.save('supplier-outstanding-report.pdf');
  }

  exportExcel() {
    // Implement Excel export logic here
  }
}
