import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss']
})
export class SalesReturnComponent implements OnInit {
  salesReturnForm: FormGroup;
  salesReturns: any[] = [];

  constructor(private fb: FormBuilder) {
    this.salesReturnForm = this.fb.group({
      invoiceNumber: [''],
      customerName: [''],
      returnDate: [''],
      product: [''],
      quantity: [''],
      reason: [''],
      refundAmount: ['']
    });
  }

  ngOnInit(): void {
    // Load sales return data if needed
  }

  onSubmit(): void {
    if (this.salesReturnForm.valid) {
      this.salesReturns.push(this.salesReturnForm.value);
      this.salesReturnForm.reset();
    }
  }
}
