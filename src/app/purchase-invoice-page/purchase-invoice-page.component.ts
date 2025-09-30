import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-invoice-page',
  templateUrl: './purchase-invoice-page.component.html',
  styleUrls: ['./purchase-invoice-page.component.scss']
})
export class PurchaseInvoicePageComponent implements OnInit {
  invoiceData: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get invoice data from navigation extras (state)
    this.invoiceData = history.state.invoiceData || {};
    // If no data, redirect back to purchase page
    if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
      this.router.navigate(['/create-purchase']);
    }
  }

  printBill() {
    window.print();
  }

  startNewTransaction() {
    this.router.navigate(['/create-purchase']);
  }
}
