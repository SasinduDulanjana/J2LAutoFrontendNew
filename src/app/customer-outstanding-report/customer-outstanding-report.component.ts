import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private customerService: CustomerService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const customerId = params.get('id');
      this.customerService.findAllCustomers().subscribe(data => {
        this.customerOptions = data;
        this.filteredCustomerOptions = data;
        if (customerId) {
          const found = this.customerOptions.find(c => c.id == customerId || c.custId == customerId);
          if (found) {
            this.customerSearchQuery = found.name;
          }
          this.selectedCustomer = customerId;
          this.onSearch();
        }
      });
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
      this.customerService.getCustomerWithOutstanding(Number(this.selectedCustomer)).subscribe(data => {
        this.outstandingData = data;
        this.loading = false;
      }, err => {
        this.loading = false;
      });
    }
  }

  exportToPDF(): void {
      
    }

  exportExcel() {
    // Implement Excel export logic here
  }
}
