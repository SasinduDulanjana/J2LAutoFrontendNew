import { Component, Inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';

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

  constructor(
    private customerService: CustomerService,
    private router: Router,
    public dialogRef: MatDialogRef<PopupCustomerListComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  openAddCustomerDialog(): void {
    const addDialog = this.dialog.open(CreateCustomerComponent, {
      width: '600px',
      disableClose: false
    });
    addDialog.afterClosed().subscribe((result: any) => {
      if (result && result.customer) {
        // Add new customer to list and select
        this.customers.push(result.customer);
        this.filteredCustomers = this.customers;
        this.dialogRef.close(result.customer);
      } else {
        // Optionally refresh customer list
        this.customerService.findAllCustomers().subscribe(customers => {
          this.customers = customers;
          this.filteredCustomers = customers;
        });
      }
    });
  }

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
