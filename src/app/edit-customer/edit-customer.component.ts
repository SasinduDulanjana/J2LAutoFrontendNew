import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit {
  customer: any = {};
  customerId!: number;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        });
      } else {
        console.error('Invalid customer ID');
      }
    });
  }

  saveCustomer(): void {
    this.customerService.updateCustomer(this.customer).subscribe(() => {
      this.router.navigate(['/customers']);
    });
  }
}
