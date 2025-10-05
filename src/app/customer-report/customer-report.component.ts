
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-report',
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss']
})
export class CustomerReportComponent implements OnInit {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private customerService: CustomerService, private router: Router) {}
  goToOutstandingReport(customer: any): void {
    const id = customer?.id ?? customer?.custId;
    // Allow navigation for Walk in Customer (custId 0)
    if (customer && id !== undefined && id !== null) {
      this.router.navigate(['/customer-outstanding-report', id]);
    } else {
      console.warn('Customer or customer.id/custId missing:', customer);
    }
  }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.loading = true;
    this.customerService.findAllCustomersWithOutstanding().subscribe({
      next: (data: any[]) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch customers.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredCustomers = this.customers.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(query)) ||
        (customer.phone && customer.phone.toLowerCase().includes(query))
      );
    } else {
      this.filteredCustomers = this.customers;
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Customer Report', 14, 16);
    const head = [[
      'Name',
      'Phone',
      'Email',
      'Address',
      'Total Sales',
      'Total Returns',
      'Outstanding'
    ]];
    const data = (this.filteredCustomers || []).map((customer: any) => [
      customer.name || '',
      customer.phone || '',
      customer.email || '',
      customer.address || '',
      customer.totalSales != null ? customer.totalSales.toFixed(2) : '',
      customer.totalReturns != null ? customer.totalReturns.toFixed(2) : '',
      customer.totalOutstanding != null ? customer.totalOutstanding.toFixed(2) : ''
    ]);
    autoTable(doc, {
      head,
      body: data,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('customer-report.pdf');
  }
}
