import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit {
  loading: boolean = false;
  customer: any = {};
  customerId!: number;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('custId');
      this.customerId = idParam ? +idParam : 0; // Handle null value
      if (this.customerId) {
        console.log('Inside if:', this.customerId);
        this.customerService.getCustomerById(this.customerId).subscribe(data => {
          this.customer = data;
          if (!this.customer.id) {
            this.customer.id = this.customerId; // Ensure id is set
          }
          this.loading = false;
        }, error => {
          this.loading = false;
        });
      } else {
        this.loading = false;
        console.error('Invalid customer ID');
      }
    });
  }

  saveCustomer(): void {
    this.loading = true;
    this.customerService.updateCustomer(this.customer).subscribe(() => {
      this.loading = false;
      const dialogRef = this.dialog.open(SuccessDialogComponent, {
        width: '350px',
        data: { message: 'Customer updated successfully!' }
      });
      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/customer-list']);
      });
    }, error => {
      this.loading = false;
    });
  }
}
