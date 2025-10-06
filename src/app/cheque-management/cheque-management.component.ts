import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-cheque-management',
  templateUrl: './cheque-management.component.html',
  styleUrls: ['./cheque-management.component.scss']
})
export class ChequeManagementComponent implements OnInit {
  loading = false;
  changeStatus(cheque: any, newStatus: string) {
    const oldStatus = cheque.status;
    cheque.status = newStatus;
    this.paymentService.editChequeStatus(cheque.chequeNo, newStatus).subscribe({
      next: () => {
        // this.reloadCheques();
        // Optionally show success message
      },
      error: () => {
        cheque.status = oldStatus; // revert on error
        // Optionally show error message
      }
    });
  }

//   reloadCheques() {
//     this.loading = true;
//     this.paymentService.getAllChequeDetails().subscribe({
//       next: (data) => {
//         this.allCheques = (data || []).map(item => ({
//           chequeNo: item.chequeNo,
//           bankName: item.bankName,
//           type: item.type,
//           party: item.customerOrSupplierName,
//           amount: item.amount,
//           issueDate: item.issueDate,
//           dueDate: item.dueDate,
//           status: item.status
//         }));
//         this.cheques = [...this.allCheques];
//         this.partyOptions = Array.from(new Set(this.allCheques.map(c => c.party).filter(Boolean)));
//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//       }
//     });
//   }

  filter = {
    fromDate: '',
    toDate: '',
    status: '',
    type: '',
    party: '',
    search: ''
  };
  partyOptions: string[] = [];
  allCheques: any[] = [];
  cheques: any[] = [];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loading = true;
    this.paymentService.getAllChequeDetails().subscribe({
      next: (data) => {
        // Map API response to table format
        this.allCheques = (data || []).map(item => ({
          chequeNo: item.chequeNo,
          bankName: item.bankName,
          type: item.type,
          party: item.customerOrSupplierName,
          amount: item.amount,
          issueDate: item.issueDate,
          dueDate: item.dueDate,
          status: item.status
        }));
        this.cheques = [...this.allCheques];
        // Populate partyOptions from unique names
        this.partyOptions = Array.from(new Set(this.allCheques.map(c => c.party).filter(Boolean)));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.cheques = this.allCheques.filter(cheque => {
      // Date range filter (compare as dates, not strings)
      let issueDate: Date | null = null;
      if (cheque.issueDate) {
        if (/^\d{2}-\d{2}-\d{4}$/.test(cheque.issueDate)) {
          const [dd, mm, yyyy] = cheque.issueDate.split('-');
          issueDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        } else {
          issueDate = new Date(cheque.issueDate);
        }
      }
      let fromDate: Date | null = this.filter.fromDate ? new Date(this.filter.fromDate) : null;
      let toDate: Date | null = this.filter.toDate ? new Date(this.filter.toDate) : null;
      const fromDateOk = !fromDate || (issueDate && issueDate >= fromDate);
      const toDateOk = !toDate || (issueDate && issueDate <= toDate);

      // Status filter
      const statusOk = !this.filter.status || cheque.status === this.filter.status;
      // Type filter (case-insensitive, allow 'Received'/'Issued' in filter)
      const typeOk = !this.filter.type || cheque.type.toLowerCase() === this.filter.type.toLowerCase();
      // Party filter
      const partyOk = !this.filter.party || cheque.party === this.filter.party;
      // Search filter (Cheque No or Bank Name)
      const search = this.filter.search.trim().toLowerCase();
      const chequeNoStr = cheque.chequeNo ? cheque.chequeNo.toString().toLowerCase() : '';
      const bankNameStr = cheque.bankName ? cheque.bankName.toLowerCase() : '';
      const searchOk = !search ||
        chequeNoStr.includes(search) ||
        bankNameStr.includes(search);
      return fromDateOk && toDateOk && statusOk && typeOk && partyOk && searchOk;
    });
  }

  clearFilters() {
    this.filter = {
      fromDate: '',
      toDate: '',
      status: '',
      type: '',
      party: '',
      search: ''
    };
    this.cheques = [...this.allCheques];
  }

  getTotal(status: string, type?: string): number {
    return this.allCheques
      .filter(c => c.status === status && (!type || c.type.toLowerCase() === type.toLowerCase()))
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  }

  getClearedThisMonth(): number {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.allCheques
      .filter(c => c.status === 'CLEARED' && this.isSameMonth(c.issueDate, month, year))
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  }

  isSameMonth(dateStr: string, month: number, year: number): boolean {
    if (!dateStr) return false;
    // Accept both dd-MM-yyyy and yyyy-MM-dd formats
    let d: Date | null = null;
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('-');
      d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      d = new Date(dateStr);
    } else {
      d = new Date(dateStr);
    }
    return d.getMonth() === month && d.getFullYear() === year;
  }

  exportToPDF(): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Cheque Management Report', 14, 14);
    doc.setFontSize(12);
    // Add summary header values
    const summary = [
      `Total Pending Received Cheques: LKR ${this.getTotal('PENDING', 'Received').toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
      `Total Pending Issued Cheques: LKR ${this.getTotal('PENDING', 'Issued').toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
      `Cleared Cheques This Month: LKR ${this.getClearedThisMonth().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
      `Bounced Cheques: LKR ${this.getTotal('BOUNCED').toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`
    ];
    summary.forEach((line, i) => {
      doc.text(line, 14, 24 + i * 8);
    });
    // Table columns and rows
    autoTable(doc, {
      head: [[
        'Cheque No', 'Bank Name', 'Type', 'Customer/Supplier', 'Amount', 'Issue Date', 'Due Date', 'Status'
      ]],
      body: this.cheques.map(c => [
        c.chequeNo,
        c.bankName,
        c.type,
        c.party,
        c.amount,
        c.issueDate,
        c.dueDate,
        c.status
      ]),
      startY: 24 + summary.length * 8 + 4,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] },
      theme: 'grid',
    });
    doc.save('cheque-management.pdf');
  }
}
