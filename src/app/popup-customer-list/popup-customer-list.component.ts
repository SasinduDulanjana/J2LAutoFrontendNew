import { Component, Inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-customer-list',
  templateUrl: './popup-customer-list.component.html',
  styleUrls: ['./popup-customer-list.component.scss']
})
export class PopupCustomerListComponent {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  // selectedCustomers: number[] = []; // Array to store selected customer IDs
  // selectAll: boolean = false;

  constructor(private customerService: CustomerService, private router: Router,public dialogRef: MatDialogRef<PopupCustomerListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
    this.loading = true;
    this.customerService.findAllCustomers().subscribe({
      next: data => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Error loading customers:', err);
      }
    });
  }
  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.toLowerCase().includes(query)
      );
    } else {
      this.filteredCustomers = this.customers;
    }
  }

  // Method to select a customer
  selectCustomer(customer: any): void {
    this.dialogRef.close(customer); // Close the dialog and return the selected customer
  }
}
