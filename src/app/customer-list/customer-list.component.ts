import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from '../models/customer.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchQuery: string = '';
  selectedCustomers: number[] = []; // Array to store selected customer IDs
  selectAll: boolean = false;

  constructor(private customerService: CustomerService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.customerService.findAllCustomers().subscribe(data => {
      this.customers = data;
      this.filteredCustomers = data;
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

  // onSelect(customerId: number): void {
  //   console.log('Selected customer:', customerId); // Log selected customer

  //   const index = this.selectedCustomers.indexOf(customerId);
  //   if (index > -1) {
  //     this.selectedCustomers.splice(index, 1);
  //   } else {
  //     this.selectedCustomers.push(customerId);
  //   }


  //   console.log('Currently selected customers:', this.selectedCustomers);
  //   this.selectAll = this.selectedCustomers.length === this.filteredCustomers.length;
  //   console.log('Select All:', this.selectAll)
  // }

  // onSelectAll(): void {
  //   if (this.selectAll) {
  //     this.selectedCustomers = this.filteredCustomers.map(customer => customer.id);
  //   } else {
  //     this.selectedCustomers = [];
  //   }
  // }

  // isSelected(customerId: number): boolean {
  //   return this.selectedCustomers.includes(customerId);
  // }

  // deleteSelected(): void {
  //   if (confirm('Are you sure you want to delete the selected customers?')) {
  //     // Call the service to delete selected customers
  //     this.customerService.deleteCustomers(this.selectedCustomers).subscribe(
  //       () => {
  //         // Remove deleted customers from the list
  //         this.customers = this.customers.filter(customer =>
  //           !this.selectedCustomers.includes(customer.id)
  //         );
  //         this.filteredCustomers = this.filteredCustomers.filter(customer =>
  //           !this.selectedCustomers.includes(customer.id)
  //         );
  //         this.selectedCustomers = [];
  //         this.selectAll = false;
  //       },
  //       error => {
  //         console.error('Error deleting customers', error);
  //       }
  //     );
  //   }
  // }

  // deleteCustomer(customerId: number): void {
  //   if (confirm('Are you sure you want to delete this customer?')) {
  //     this.customerService.deleteCustomer(customerId).subscribe(
  //       () => {
  //         this.customers = this.customers.filter(customer => customer.id !== customerId);
  //         this.filteredCustomers = this.filteredCustomers.filter(customer => customer.id !== customerId);
  //       },
  //       error => {
  //         console.error('Error deleting customer', error);
  //       }
  //     );
  //   }
  // }

  
  deleteCustomer(customer: Customer): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this customer?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.deleteCustomer(customer).subscribe(
          () => {
            this.customerService.findAllCustomers().subscribe(
              (activeCustomers: Customer[]) => {
                this.customers = activeCustomers;
                this.filteredCustomers = activeCustomers;
              },
              error => {
                console.error('Error fetching active customers:', error);
              }
            );
          },
          error => {
            console.error('Error deleting customer', error);
          }
        );
      }
    });
  }

  editCustomer(customer: any): void {
    console.log('Customer:', customer);
    if (customer?.custId) {
      this.router.navigate(['/edit-customer', customer.custId]);
    } else {
      console.error('Customer ID is undefined or null.');
    }
  }

  openCreateCustomerPopup() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      width: '800px', // Adjust the width as needed
      data: {} // You can pass data to the dialog here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
      }
    });
  }

  navigateToCreateCustomer() {
    this.router.navigate(['/create-customer']);
  }
}
