

import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';
import { PurchaseService } from '../../services/purchase.service';


@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.scss']
})
export class PurchaseReturnComponent {
  invoiceNumber: string = '';
  purchase: any = null;
  purchasedProducts: any[] = [];
  error: string = '';
  loading: boolean = false;
  returnGood: number[] = [];
  returnDamaged: number[] = [];
  reasonGood: string[] = [];
  reasonDamaged: string[] = [];
  refundAmountGood: number[] = [];
  refundAmountDamaged: number[] = [];
  batchNumber: string[] = [];

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog) {}

  // Compute unit price for a purchased product. Prefer purchasePrice, fallback to retailPrice.
  private getUnitPrice(product: any): number {
    if (!product) return 0;
    const unit = Number(product.purchasePrice || product.retailPrice || 0);
    return unit;
  }

  // Auto-calc refund amount when Good qty changes
  onGoodQtyChange(i: number) {
    if (!this.purchasedProducts[i]) return;
    let qty = Number(this.returnGood[i] || 0);
    const purchasedQty = Number(this.purchasedProducts[i].quantity || 0);
    const refundedQty = Number(this.purchasedProducts[i].refundedQty || 0);
    const remaining = Math.max(0, purchasedQty - refundedQty);
    if (qty > remaining) {
      qty = remaining;
      this.returnGood[i] = qty;
    }
    const unit = this.getUnitPrice(this.purchasedProducts[i]);
    this.refundAmountGood[i] = Number((unit * qty).toFixed(2));
  }

  fetchPurchaseByInvoiceNumber() {
    this.error = '';
    this.purchase = null;
    this.purchasedProducts = [];
    this.returnGood = [];
    this.returnDamaged = [];
    this.reasonGood = [];
    this.reasonDamaged = [];
    if (!this.invoiceNumber) {
      this.error = 'Please enter an invoice number.';
      return;
    }
    this.loading = true;
    this.purchaseService.getPurchaseByIdentifier(this.invoiceNumber).subscribe({
      next: (purchase: any) => {
        if (purchase) {
          this.purchase = purchase;
          if (!purchase.products || purchase.products.length === 0) {
            this.error = 'No products found for this purchase.';
            this.loading = false;
            return;
          }
          // Prepare requests for all products in the purchase
          const products = purchase.products || [];
          const productIds = products.map((p: any) => p.product?.productId || p.productId || 0).filter((id: number) => !!id);
          if (productIds.length === 0) {
            this.error = 'Invalid product IDs for this purchase.';
            this.loading = false;
            return;
          }

          const batchRequests = productIds.map((pid: number) => this.purchaseService.getProductBatchDetails(purchase.purchaseId, pid));

          // Execute all batch requests in parallel and combine results
          (forkJoin(batchRequests) as any).subscribe((batchDetailsArr: any[]) => {
              // batchDetailsArr is an array of responses, one per product
              const aggregated: any[] = [];
              batchDetailsArr.forEach((batchDetails: any, idx: number) => {
                let detailsArr: any[] = [];
                if (Array.isArray(batchDetails)) {
                  detailsArr = batchDetails;
                } else if (batchDetails && typeof batchDetails === 'object') {
                  detailsArr = [batchDetails];
                }
                // Map each batch entry to the UI row format
                detailsArr.forEach(item => {
                  aggregated.push({
                    productId: item.productId || productIds[idx],
                    productName: item.productName || item.productName || products[idx]?.product?.productName || products[idx]?.productName || '',
                    batchNo: item.batchNumber || item.batchNo || '',
                    quantity: item.qty != null ? item.qty : (item.quantity != null ? item.quantity : 0),
                    purchasePrice: item.unitCost != null ? item.unitCost : item.unit_cost || 0,
                    retailPrice: item.retailPrice != null ? item.retailPrice : item.salePrice || 0,
                    refundedQty: item.refundedQty || 0,
                    refundedAmount: item.refundedAmount || 0
                  });
                });
              });

              this.purchasedProducts = aggregated;
              this.returnGood = this.purchasedProducts.map(p => 0);
              this.returnDamaged = this.purchasedProducts.map(p => 0);
              this.reasonGood = this.purchasedProducts.map(p => '');
              this.reasonDamaged = this.purchasedProducts.map(p => '');
              this.refundAmountGood = this.purchasedProducts.map(p => 0);
              this.refundAmountDamaged = this.purchasedProducts.map(p => 0);
              this.batchNumber = this.purchasedProducts.map(p => p.batchNo || '');
              this.loading = false;
          }, () => {
            this.error = 'Error fetching product batch details.';
            this.loading = false;
          });
        } else {
          this.error = 'No purchase found for this identifier.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error fetching purchase by identifier.';
        this.loading = false;
      }
    });
  }

  submitAllReturns() {
    if (!this.purchase) return;
    // Validation: for each product, ensure the sum of good + damaged does not exceed remaining quantity
    // Important: don't block the entire submission just because another product is already fully refunded.
    for (let i = 0; i < this.purchasedProducts.length; i++) {
      const goodReturn = (this.returnGood[i] || 0);
      const damagedReturn = (this.returnDamaged[i] || 0);
      const totalReturn = goodReturn + damagedReturn;
      // If user didn't enter any return for this row, skip validations for it
      if (totalReturn === 0) continue;

      const purchasedQty = this.purchasedProducts[i].quantity;
      const refundedQty = this.purchasedProducts[i].refundedQty || 0;

      // If the product is already fully refunded and user is trying to return more, block only this row
      if (refundedQty >= purchasedQty) {
        this.error = `All quantities for ${this.purchasedProducts[i].product?.productName || 'product'} have already been refunded. No further returns allowed for this item.`;
        return;
      }

      // Ensure requested return does not exceed remaining available qty for this product
      if (totalReturn > (purchasedQty - refundedQty)) {
        this.error = `Return quantity for ${this.purchasedProducts[i].product?.productName || 'product'} exceeds available quantity (already refunded: ${refundedQty}).`;
        return;
      }
    }
    const returns: any[] = [];
    this.purchasedProducts.forEach((product, i) => {
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
      purchaseId: this.purchase.purchaseId || 1,
      invoiceNumber: this.purchase.invoiceNumber,
      supplierName: this.purchase.supplierName || '',
      returns
    };
    this.loading = true;
    this.purchaseService.savePurchaseReturn(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.error = '';
        // Always show a custom success message in the popup
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Purchase return has been saved successfully!' }
        });
        this.returnGood = this.purchasedProducts.map(p => 0);
        this.returnDamaged = this.purchasedProducts.map(p => 0);
        this.reasonGood = this.purchasedProducts.map(p => '');
        this.reasonDamaged = this.purchasedProducts.map(p => '');
        this.purchase = null;
        this.purchasedProducts = [];
        this.invoiceNumber = '';
      },
      error: (err) => {
        this.loading = false;
        console.error('Error saving purchase return:', err);
        // If backend returns success message in error response, treat as success
        const errMsg = err?.error?.message || err?.error || '';
        if (typeof errMsg === 'string' && errMsg.includes('Purchase return processed successfully.')) {
          this.error = '';
          this.dialog.open(SuccessDialogComponent, {
            data: { message: errMsg }
          });
          this.returnGood = this.purchasedProducts.map(p => 0);
          this.returnDamaged = this.purchasedProducts.map(p => 0);
          this.reasonGood = this.purchasedProducts.map(p => '');
          this.reasonDamaged = this.purchasedProducts.map(p => '');
          this.purchase = null;
          this.purchasedProducts = [];
          this.invoiceNumber = '';
        } else {
          this.error = errMsg || 'Error saving purchase return.';
        }
      }
    });
  }
}
