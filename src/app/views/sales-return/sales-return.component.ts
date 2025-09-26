import { Component } from '@angular/core';
import { SaleService } from '../../services/sale.service';
import { Sale } from '../../models/sale.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss']
})
export class SalesReturnComponent {
  returnGood: number[] = [];
  returnDamaged: number[] = [];
  reasonGood: string[] = [];
  reasonDamaged: string[] = [];
  refundAmount: number[] = [];
  refundAmountGood: number[] = [];
  refundAmountDamaged: number[] = [];
  batchNumber: string[] = [];

  submitAllReturns() {
    if (!this.sale) return;
    // Validation: sum of good + damaged <= sold quantity for each product
    for (let i = 0; i < this.soldProducts.length; i++) {
      const totalReturn = (this.returnGood[i] || 0) + (this.returnDamaged[i] || 0);
      const soldQty = this.soldProducts[i].quantity;
      const refundedQty = this.soldProducts[i].refundedQty || 0;
      if (refundedQty >= soldQty) {
        this.error = `All quantities for ${this.soldProducts[i].product?.productName || 'product'} have already been refunded. No further returns allowed.`;
        return;
      }
      if (totalReturn > (soldQty - refundedQty)) {
        this.error = `Return quantity for ${this.soldProducts[i].product?.productName || 'product'} exceeds available quantity (already refunded: ${refundedQty}).`;
        return;
      }
    }
    const returns: any[] = [];
    this.soldProducts.forEach((product, i) => {
      const productId = product.product?.productId || product.productId;
      if (this.returnGood[i] > 0) {
        returns.push({
          productId,
          quantityToReturn: this.returnGood[i],
          condition: 'Good',
          reason: this.reasonGood[i] || '',
          refundAmount: this.refundAmountGood[i] || 0,
          batchNumber: this.batchNumber[i] || ''
        });
      }
      if (this.returnDamaged[i] > 0) {
        returns.push({
          productId,
          quantityToReturn: this.returnDamaged[i],
          condition: 'Damaged',
          reason: this.reasonDamaged[i] || '',
          refundAmount: this.refundAmountDamaged[i] || 0,
          batchNumber: this.batchNumber[i] || ''
        });
      }
    });
    if (returns.length === 0) {
      this.error = 'Please enter return quantities.';
      return;
    }
    const payload = {
      saleId: this.sale.saleId || this.sale.id,
      invoiceNumber: this.sale.invoiceNumber,
      customerName: this.sale.customer?.name || '',
      returns
    };
    this.loading = true;
    this.saleService.salesReturn(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.error = '';
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Sales return processed successfully!' }
        });
        dialogRef.afterClosed().subscribe(() => {
          this.returnGood = this.soldProducts.map(p => 0);
          this.returnDamaged = this.soldProducts.map(p => 0);
          this.reasonGood = this.soldProducts.map(p => '');
          this.reasonDamaged = this.soldProducts.map(p => '');
          this.sale = null;
          this.soldProducts = [];
          this.invoiceNumber = '';
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to save sales return.';
      }
    });
  }
  // Removed unused arrays for new design
  invoiceNumber: string = '';
  sale: Sale | null = null;
  soldProducts: any[] = [];
  error: string = '';
  loading: boolean = false;

  constructor(private saleService: SaleService, private dialog: MatDialog) {}

  fetchSaleByInvoiceNumber() {
    this.error = '';
    this.sale = null;
    this.soldProducts = [];
      this.returnGood = [];
      this.returnDamaged = [];
      this.reasonGood = [];
      this.reasonDamaged = [];
    if (!this.invoiceNumber) {
      this.error = 'Please enter an invoice number.';
      return;
    }
    this.loading = true;
      this.saleService.getSaleByInvoiceNumber(this.invoiceNumber).subscribe({
        next: (sale: Sale) => {
          if (sale) {
            this.sale = sale;
            // Now fetch products for this sale
            if (typeof sale.saleId === 'number') {
              this.saleService.getProductsForSale(sale.saleId).subscribe({
                next: (products: any[]) => {
                  this.soldProducts = products || [];
                  this.returnGood = this.soldProducts.map(p => 0);
                  this.returnDamaged = this.soldProducts.map(p => 0);
                  this.reasonGood = this.soldProducts.map(p => '');
                  this.reasonDamaged = this.soldProducts.map(p => '');
                  this.refundAmount = this.soldProducts.map(p => 0);
                  this.refundAmountGood = this.soldProducts.map(p => 0);
                  this.refundAmountDamaged = this.soldProducts.map(p => 0);
                  // Set batchNumber from response if available
                  this.batchNumber = this.soldProducts.map(p => p.batchNo || '');
                  this.loading = false;
                },
                error: () => {
                  this.error = 'Error fetching products for sale.';
                  this.loading = false;
                }
              });
            } else {
              this.error = 'Sale ID is missing.';
              this.loading = false;
            }
          } else {
            this.error = 'No sale found for this invoice number.';
            this.loading = false;
          }
        },
        error: () => {
          this.error = 'Error fetching sale by invoice number.';
          this.loading = false;
        }
      });
  }

    // Removed per-row submitReturn logic
}
