// src/app/create-customer/create-customer.component.ts
import { Component } from '@angular/core';
import { CustomerService } from '../services/customer.service'; // Correct path to the service
import { Customer } from '../models/customer.model'; // Correct path to the model
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent {
  companyName: string = '';
  customer: Customer = new Customer('', '', '', ''); // Initialize with empty values or defaults
  countryCode: string = '+94';
  phoneExists: boolean = false;
  loading: boolean = false;

  constructor(private customerService: CustomerService, private location: Location, private dialog: MatDialog) { }

  goBack(): void {
    this.location.back(); // Navigates to the previous page
  }

  createCustomer(): void {
    if (this.phoneExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Phone number already exists!' }
      });
      return;
    }
    this.loading = true;
    // Concatenate company name with customer name, and country code with phone before sending
    const payload = {
      ...this.customer,
      name: this.companyName ? `${this.companyName} ${this.customer.name}` : this.customer.name,
      phone: `${this.countryCode}${this.customer.phone}`
    };
    this.customerService.createCustomer(payload)
      .subscribe(response => {
        this.loading = false;
        console.log('Customer created:', response);
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          width: '350px',
          data: { message: 'Customer created successfully!' }
        });
        dialogRef.afterClosed().subscribe(() => {
          // Reset the form fields
          this.customer = new Customer('', '', '', '');
          this.companyName = '';
          this.countryCode = '+94';
        });
      }, error => {
        this.loading = false;
        let errorMsg = 'Error creating customer.';
        if (error && error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        this.dialog.open(FailureDialogComponent, {
          width: '350px',
          data: { message: errorMsg }
        });
        console.error('Error creating customer:', error);
      });
  }

  onPhoneChange(phone: string): void {
    this.customerService.findAllCustomers().subscribe((customers: Customer[]) => {
      this.phoneExists = customers.some((c: Customer) => c.phone.trim() === phone.trim());
    });
  }
}
