import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-cheque-management',
  templateUrl: './cheque-management.component.html',
  styleUrls: ['./cheque-management.component.scss']
})
export class ChequeManagementComponent implements OnInit {
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
    this.paymentService.getAllChequeDetails().subscribe(data => {
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
    });
  }

  applyFilters() {
    this.cheques = this.allCheques.filter(cheque => {
      // Date range filter
      const fromDateOk = !this.filter.fromDate || cheque.issueDate >= this.filter.fromDate;
      const toDateOk = !this.filter.toDate || cheque.issueDate <= this.filter.toDate;
      // Status filter
      const statusOk = !this.filter.status || cheque.status === this.filter.status;
      // Type filter
      const typeOk = !this.filter.type || cheque.type === this.filter.type;
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
}
