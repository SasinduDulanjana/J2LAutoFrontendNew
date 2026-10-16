import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../services/purchase.service';
import { SaleService } from '../services/sale.service';
import { Product } from '../models/product.model';
import { Purchase } from '../models/purchase.model';
import { MatDialog } from '@angular/material/dialog';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.component.html',
  styleUrls: ['./purchase-details.component.scss']
})
export class PurchaseDetailsComponent implements OnInit {
  purchaseId: number = 0;
  purchase: any = null;
  isLoading: boolean = true;
  expandedProductId: number | null = null;
  batchNumber: string | null = null;
  soldProducts: any[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private saleService: SaleService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.purchaseId = params['id'];
      if (this.purchaseId) {
        this.fetchPurchaseDetails();
      }
    });
  }

  fetchPurchaseDetails(): void {
    this.isLoading = true;
    this.purchaseService.getPurchaseById(this.purchaseId).subscribe(
      (data: any) => {
        this.purchase = data;
        // Fetch products by batch details
        if (this.purchase.products && this.purchase.products.length > 0) {
          this.fetchProductsByBatch();
        } else {
          this.isLoading = false;
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.dialog.open(FailureDialogComponent, {
          width: '350px',
          data: { message: 'Failed to load purchase details.' }
        });
        console.error('Error fetching purchase:', error);
      }
    );
  }

  fetchProductsByBatch(): void {
    // Get batch details for the first product
    const firstProduct = this.purchase.products[0];
    if (!firstProduct || !firstProduct.productId) {
      this.isLoading = false;
      return;
    }
    
    // Store original products to preserve retailPrice and other fields
    const originalProducts = { ...this.purchase.products };
    
    // Get batch number from first product or purchase object
    const batchNumber = firstProduct.batchNo || firstProduct.batchNumber || this.purchase.batchNo || this.purchase.batchNumber;
    
    console.log('Purchase object:', this.purchase);
    console.log('First product:', firstProduct);
    console.log('Batch number being sent:', batchNumber);
    
    this.purchaseService.getProductBatchDetails(this.purchaseId, firstProduct.productId, batchNumber).subscribe(
      (response: any) => {
        if (response && response.productBatchResponses && response.productBatchResponses.length > 0) {
          // Map batch response products and merge with original product data
          const products = response.productBatchResponses.map((batchProduct: any) => {
            // Find corresponding original product to get retailPrice and other fields
            const originalProduct = this.purchase.products.find((p: any) => p.productId === batchProduct.productId) || {};
            
            return {
              ...batchProduct,
              cost: batchProduct.unitCost || batchProduct.cost || originalProduct.cost,
              retailPrice: batchProduct.retailPrice || originalProduct.retailPrice,  // Preserve retailPrice
              remainingQty: batchProduct.qty || batchProduct.remainingQty || originalProduct.remainingQty,
              unsoldQty: batchProduct.unsoldQty || originalProduct.unsoldQty,
            };
          });
          
          // Replace products with the batch details products
          this.purchase.products = products;
          // Extract batch number from root level
          this.batchNumber = response.batchNumber || null;
          
          // Fetch sold products for this batch
          if (this.batchNumber) {
            this.fetchSoldProductsByBatch();
          } else {
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
        }
      },
      (error: any) => {
        console.error('Error fetching batch products:', error);
        this.isLoading = false;
      }
    );
  }

  fetchSoldProductsByBatch(): void {
    if (!this.batchNumber) {
      this.isLoading = false;
      return;
    }
    
    this.saleService.getSalesByBatchNumber(this.batchNumber).subscribe(
      (salesResponse: any) => {
        // Store sold products data
        this.soldProducts = salesResponse || [];
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching sold products:', error);
        this.isLoading = false;
      }
    );
  }

  private getSoldProductLineEntries(): any[] {
    if (!Array.isArray(this.soldProducts)) return [];

    return this.soldProducts.flatMap((saleOrItem: any) => {
      if (!saleOrItem) return [];

      const saleEntries = Array.isArray(saleOrItem.soldProducts)
        ? saleOrItem.soldProducts
        : Array.isArray(saleOrItem.saleProducts)
          ? saleOrItem.saleProducts
          : [saleOrItem];

      return saleEntries
        .map((entry: any) => {
          const productId = entry?.productId ?? entry?.product?.productId ?? entry?.product?.id ?? saleOrItem?.productId ?? saleOrItem?.product?.productId ?? saleOrItem?.product?.id;
          const qty = Number(entry?.qty ?? entry?.quantity ?? entry?.soldQty ?? entry?.productQty ?? 0) || 0;
          const unitPrice = Number(entry?.retailPrice ?? entry?.unitPrice ?? entry?.price ?? entry?.product?.retailPrice ?? entry?.product?.salePrice ?? saleOrItem?.retailPrice ?? saleOrItem?.unitPrice ?? 0) || 0;
          const lineTotal = Number(
            entry?.discountedTotal ??
            entry?.lineTotal ??
            (qty > 0 && unitPrice > 0 ? qty * unitPrice : undefined) ??
            entry?.totalAmount ??
            entry?.finalAmount ??
            0
          ) || 0;

          return {
            ...entry,
            productId,
            qty,
            retailPrice: unitPrice,
            totalAmount: lineTotal,
          };
        })
        .filter((entry: any) => entry.productId !== null && entry.productId !== undefined);
    });
  }

  // Calculate total cost for all products
  calculateTotalPurchaseCost(): number {
    if (!this.purchase || !this.purchase.products) return 0;
    return this.purchase.products.reduce((total: number, product: any) => {
      const purchasedQty = product.qty || product.remainingQty || 0;
      return total + (product.cost || 0) * purchasedQty;
    }, 0);
  }

  // Sum of the Selling Price column in the product table
  calculateTotalAssignedSellingPrice(): number {
    if (!this.purchase || !Array.isArray(this.purchase.products)) return 0;

    return this.purchase.products.reduce((total: number, product: any) => {
      return total + (Number(product?.retailPrice ?? product?.salePrice ?? 0) || 0);
    }, 0);
  }

  // Calculate total selling price based on actual sold product values
  calculateTotalSellingPrice(): number {
    return this.getSoldProductLineEntries().reduce((total: number, item: any) => {
      return total + (Number(item.totalAmount) || 0);
    }, 0);
  }

  // Calculate profit/loss
  calculateProfitLoss(): number {
    return this.calculateTotalSellingPrice() - this.calculateTotalPurchaseCost();
  }

  // Get remaining quantity for a product
  getRemainingQuantity(product: any): number {
    const purchasedQty = product.qty || product.remainingQty || 0;
    const actualSoldQty = this.getActualSoldQuantity(product);
    return Math.max(0, purchasedQty - actualSoldQty);
  }

  // Get sold quantity for a product from soldProducts
  getActualSoldQuantity(product: any): number {
    const productId = product?.productId ?? product?.id;
    if (productId === null || productId === undefined) return 0;

    return this.getSoldProductLineEntries()
      .filter((item: any) => String(item.productId) === String(productId))
      .reduce((sum: number, item: any) => sum + (Number(item.qty) || 0), 0);
  }

  // Get total selling price for a product using the actual sold price from sales data
  getProductTotalSellingPrice(product: any): number {
    const productId = product?.productId ?? product?.id;
    if (productId === null || productId === undefined) return 0;

    return this.getSoldProductLineEntries()
      .filter((item: any) => String(item.productId) === String(productId))
      .reduce((sum: number, item: any) => {
        const lineValue = Number(item.totalAmount) || 0;
        const fallbackValue = (Number(item.qty) || 0) * (Number(item.retailPrice) || 0);
        return sum + (lineValue || fallbackValue);
      }, 0);
  }

  // Get sold quantity for a product
  getSoldQuantity(product: any): number {
    const purchasedQty = product.qty || product.remainingQty || 0;
    const unsoldQty = product.unsoldQty || 0;
    return Math.max(0, purchasedQty - unsoldQty);
  }

  // Cost of the remaining unsold items only
  getRemainingCost(product: any): number {
    const purchasedQty = Number(product?.qty ?? product?.remainingQty ?? 0) || 0;
    const actualSoldQty = this.getActualSoldQuantity(product);
    const remainingQty = Math.max(0, purchasedQty - actualSoldQty);
    const unitCost = Number(product?.cost ?? 0) || 0;
    return remainingQty * unitCost;
  }

  calculateTotalRemainingCost(): number {
    if (!this.purchase || !Array.isArray(this.purchase.products)) return 0;

    return this.purchase.products.reduce((total: number, product: any) => {
      return total + this.getRemainingCost(product);
    }, 0);
  }

  // Get profit/loss for individual product
  getProductProfitLoss(product: any): number {
    const actualSoldQty = this.getActualSoldQuantity(product);
    const costTotal = (product.cost || 0) * actualSoldQty;
    const sellingTotal = this.getProductTotalSellingPrice(product);
    return sellingTotal - costTotal;
  }

  // Get cost coverage status
  isCostCovered(): boolean {
    return this.calculateTotalSellingPrice() >= this.calculateTotalPurchaseCost();
  }

  // Format invoice date from string format "dd-MM-yyyy HH:mm:ss"
  getFormattedInvoiceDate(): string {
    if (!this.purchase || !this.purchase.invoiceDate) return '-';
    
    const dateStr = this.purchase.invoiceDate;
    // Parse date string in format "dd-MM-yyyy HH:mm:ss"
    const parts = dateStr.split(' ')[0].split('-'); // Get "dd-MM-yyyy" part
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      // Create date from parsed components
      const monthIndex = parseInt(month) - 1;
      const dateObj = new Date(parseInt(year), monthIndex, parseInt(day));
      
      // Format as needed (e.g., "19-May-2026")
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
    
    return dateStr;
  }
  toggleProductDetails(productId: number): void {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }

  // Calculate total items purchased
  calculateTotalItemsPurchased(): number {
    if (!this.purchase || !this.purchase.products) return 0;
    return this.purchase.products.reduce((sum: number, p: any) => sum + (p.qty || p.remainingQty || 0), 0);
  }

  // Calculate total items sold
  calculateTotalItemsSold(): number {
    return this.getSoldProductLineEntries().reduce((sum: number, item: any) => {
      return sum + (Number(item.qty) || 0);
    }, 0);
  }

  // Calculate total items remaining
  calculateTotalItemsRemaining(): number {
    if (!this.purchase || !this.purchase.products) return 0;
    return this.purchase.products.reduce((sum: number, p: any) => sum + this.getRemainingQuantity(p), 0);
  }

  // Navigate back
  goBack(): void {
    this.router.navigate(['/purchase-list']);
  }
}
