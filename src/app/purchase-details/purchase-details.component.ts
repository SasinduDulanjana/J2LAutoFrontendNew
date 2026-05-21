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

  // Calculate total cost for all products
  calculateTotalPurchaseCost(): number {
    if (!this.purchase || !this.purchase.products) return 0;
    return this.purchase.products.reduce((total: number, product: any) => {
      const purchasedQty = product.qty || product.remainingQty || 0;
      return total + (product.cost || 0) * purchasedQty;
    }, 0);
  }

  // Calculate total selling price based on actual sold products
  calculateTotalSellingPrice(): number {
    if (!this.soldProducts || this.soldProducts.length === 0) return 0;
    
    return this.soldProducts.reduce((total: number, sale: any) => {
      return total + (sale.totalAmount || 0);
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
    if (!this.soldProducts || this.soldProducts.length === 0) return 0;
    
    // Sum quantities from sold products for this product
    const soldQty = this.soldProducts
      .filter((sale: any) => sale.productId === product.productId)
      .reduce((sum: number, sale: any) => sum + (sale.qty || 0), 0);
    
    return soldQty;
  }

  // Get total selling price for a product from soldProducts
  getProductTotalSellingPrice(product: any): number {
    if (!this.soldProducts || this.soldProducts.length === 0) return 0;
    
    // Sum total amounts for this product
    const totalSold = this.soldProducts
      .filter((sale: any) => sale.productId === product.productId)
      .reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
    
    return totalSold;
  }

  // Get sold quantity for a product
  getSoldQuantity(product: any): number {
    const purchasedQty = product.qty || product.remainingQty || 0;
    const unsoldQty = product.unsoldQty || 0;
    return Math.max(0, purchasedQty - unsoldQty);
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
    if (!this.soldProducts || this.soldProducts.length === 0) return 0;
    return this.soldProducts.reduce((sum: number, sale: any) => {
      return sum + (sale.qty || 0);
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
