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
    // Validation: for each product, ensure the sum of good + damaged does not exceed remaining quantity
    // Important: don't block the entire submission just because another product is already fully refunded.
    for (let i = 0; i < this.soldProducts.length; i++) {
      const goodReturn = (this.returnGood[i] || 0);
      const damagedReturn = (this.returnDamaged[i] || 0);
      const totalReturn = goodReturn + damagedReturn;
      // If user didn't enter any return for this row, skip validations for it
      if (totalReturn === 0) continue;

      const soldQty = this.soldProducts[i].quantity;
      const refundedQty = this.soldProducts[i].refundedQty || 0;

      // If the product is already fully refunded and user is trying to return more, block only this row
      if (refundedQty >= soldQty) {
        this.error = `All quantities for ${this.soldProducts[i].product?.productName || 'product'} have already been refunded. No further returns allowed for this item.`;
        return;
      }

      // Ensure requested return does not exceed remaining available qty for this product
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
      customerId: this.sale.customer?.id || this.sale.customer?.custId || '',
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

  // Compute unit price for a sold product. Prefer discountedTotal/quantity if available, fallback to retailPrice
  private getUnitPrice(product: any): number {
    if (!product) return 0;
    const qty = Number(product.quantity) || 1;
    const discountedTotal = Number(product.discountedTotal || 0);
    if (discountedTotal > 0 && qty > 0) return discountedTotal / qty;
    const retail = Number(product.retailPrice || 0);
    return retail;
  }

  // Auto-calc refund amount when Good qty changes
  onGoodQtyChange(i: number) {
    if (!this.soldProducts[i]) return;
    let qty = Number(this.returnGood[i] || 0);
    const soldQty = Number(this.soldProducts[i].quantity || 0);
    const refundedQty = Number(this.soldProducts[i].refundedQty || 0);
    const remaining = Math.max(0, soldQty - refundedQty);
    if (qty > remaining) {
      qty = remaining;
      this.returnGood[i] = qty;
    }
    const unit = this.getUnitPrice(this.soldProducts[i]);
    this.refundAmountGood[i] = Number((unit * qty).toFixed(2));
  }

  // Auto-calc refund amount when Damaged qty changes
  onDamagedQtyChange(i: number) {
    if (!this.soldProducts[i]) return;
    let qty = Number(this.returnDamaged[i] || 0);
    const soldQty = Number(this.soldProducts[i].quantity || 0);
    const refundedQty = Number(this.soldProducts[i].refundedQty || 0);
    const remaining = Math.max(0, soldQty - refundedQty);
    if (qty > remaining) {
      qty = remaining;
      this.returnDamaged[i] = qty;
    }
    const unit = this.getUnitPrice(this.soldProducts[i]);
    this.refundAmountDamaged[i] = Number((unit * qty).toFixed(2));
  }

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
                  // Ensure refunded fields are numeric and default to 0 so template logic works
                  this.soldProducts.forEach(p => {
                    p.refundedQty = Number(p.refundedQty || 0);
                    p.refundedAmount = Number(p.refundedAmount || 0);
                  });
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
