import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.scss']
})
export class PurchaseReturnComponent implements OnInit {
  purchaseReturnForm: FormGroup;
  purchaseReturns: any[] = [];

  constructor(private fb: FormBuilder) {
    this.purchaseReturnForm = this.fb.group({
      invoiceNumber: [''],
      supplierName: [''],
      returnDate: [''],
      product: [''],
      quantity: [''],
      reason: [''],
      refundAmount: ['']
    });
  }

  ngOnInit(): void {
    // Load purchase return data if needed
  }

  onSubmit(): void {
    if (this.purchaseReturnForm.valid) {
      this.purchaseReturns.push(this.purchaseReturnForm.value);
      this.purchaseReturnForm.reset();
    }
  }
}
