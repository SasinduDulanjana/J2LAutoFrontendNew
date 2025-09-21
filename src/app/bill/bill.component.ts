import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent {
  @Input() invoiceNumber!: string;
  @Input() currentDate!: string;
  @Input() selectedCustomerName!: string;
  @Input() loggedUserName!: string;
  @Input() saleItems: any[] = [];
  @Input() billWiseDiscountPercentage!: number;
  @Input() saleItem: any;
  @Input() getSubtotal!: () => number;
  @Input() getTotalDiscount!: () => number;
  @Input() getTotalBillWiseDiscount!: () => number;
  @Input() getTotal!: () => number;

  printBill() {
    window.print();
  }
}
