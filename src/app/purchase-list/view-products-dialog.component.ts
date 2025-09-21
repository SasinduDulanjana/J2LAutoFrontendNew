import { BASE_URL } from '../base-url';
import { Component, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../services/product.service';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-products-dialog',
  templateUrl: './view-products-dialog.component.html',
  styleUrls: ['./view-products-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewProductsDialogComponent {
  public data: { products: any[]; purchaseId?: number } = { products: [] };
  public loading = true;
  constructor(
    private dialogRef: MatDialogRef<ViewProductsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { products: any[]; purchaseId?: number },
    private cdr: ChangeDetectorRef,
    private productService: ProductService
  ) {
    this.data = data;
    // Map and clean product fields for template compatibility
    const products = (data.products || []).map((p: any) => ({
      productName: p.productName || p.product_name || 'N/A',
      sku: p.sku || p.SKU || 'N/A',
      batchNo: p.batchNo || p.batch_no || 'N/A',
      salePrice: p.salePrice || p.sale_price || 'N/A',
      unitCost: p.unitCost || p.unit_cost || 'N/A',
      wholeSalePrice: p.wholeSalePrice || p.wholesalePrice || p.whole_sale_price || 'N/A',
      lowQty: p.lowQty || p.low_qty || 'N/A',
      qty: p.qty || p.quantity || 'N/A',
      productId: p.productId || p.id || p.product_id || 'N/A',
      purchaseId: data.purchaseId || 'N/A'
    }));

    // Fetch batchDetails for each product by SKU
    const batchRequests = products.map(prod =>
  this.productService['http'].post(`${BASE_URL}/purchase/api/getProductBatchDetails`, {
          purchaseId: data.purchaseId,
          productId: prod.productId
        })
    );

    forkJoin(batchRequests).subscribe(batchDetailsArr => {
          const productsWithBatch = products.map((prod, idx) => {
            const batchDetails = batchDetailsArr[idx] as any || {};
            // Map backend response fields to frontend fields
            const batchNo = batchDetails.batchNumber !== undefined && batchDetails.batchNumber !== null ? batchDetails.batchNumber : 'N/A';
            const salePrice = batchDetails.retailPrice !== undefined && batchDetails.retailPrice !== null ? batchDetails.retailPrice : 'N/A';
            const unitCost = batchDetails.unitCost !== undefined && batchDetails.unitCost !== null ? batchDetails.unitCost : 'N/A';
            const purchaseQty = batchDetails.qty !== undefined && batchDetails.qty !== null ? batchDetails.qty : 'N/A';
            return {
              ...prod,
              batchNo,
              salePrice,
              batchDetails,
              unitCost,
              purchaseQty,
            };
          });
          this.data.products = productsWithBatch;
          this.loading = false;
          this.cdr.markForCheck();
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
