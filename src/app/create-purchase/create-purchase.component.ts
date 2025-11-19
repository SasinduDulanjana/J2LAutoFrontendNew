import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../services/purchase.service'; // Correct path to the service
import { Purchase } from '../models/purchase.model'; // Correct path to the model
import { Product } from '../models/product.model';
import { SupplierService } from '../services/supplier.service'; // Correct path to the service
import { ProductService } from '../services/product.service';
import { Supplier } from '../models/supplier.model'; // Correct path to the model
import { Batch } from '../models/batch.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateProductComponent } from '../create-product/create-product.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { QuantityInputComponent } from '../quantity-input/quantity-input.component';
import { CreateSupplierComponent } from '../create-supplier/create-supplier.component';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { BillDialogComponent } from '../bill/bill-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';


@Component({
  selector: 'app-create-purchase',
  templateUrl: './create-purchase.component.html',
  styleUrls: ['./create-purchase.component.scss']
})
export class CreatePurchaseComponent implements OnInit {
  isLoadingInvoice: boolean = false;
  suppliers: Supplier[] = [];
  selectedSupplierId: number = 0;
  purchase: Purchase = new Purchase(0,'', '', '', '', '', [], 0, 0, false); // Initialize with empty values or defaults
  productSearchTerm: string = '';
  searchResults: Product[] = [];
  allProducts: Product[] = []; // Holds the complete list of products
  batchNumbers: { [sku: string]: Batch[] } = {};
  selectedTab: number = 1;
  paidAmount: number = 0;
  paymentType: string = '';
  chequeNumber: string = '';
  bankName: string = '';
  chequeDate: string = '';

  constructor(
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  // Open the Create Product dialog as a popup and optionally add the created product to purchase
  openCreateProductPopup(): void {
    const dialogRef = this.dialog.open(CreateProductComponent, {
      width: '900px',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.product) {
        const newProd = result.product as any;
        // Ensure defaults for the product object so the search and batch cache work
        newProd.batchNo = newProd.batchNo ?? '';
        newProd.remainingQty = newProd.remainingQty ?? 1;
        newProd.retailPrice = newProd.retailPrice ?? newProd.salePrice ?? 0;

        // Preload batch numbers into the local cache for this SKU so the dropdown/batch selector
        // will have data if the user selects this product after creation. Do NOT auto-add to table.
        if (newProd.sku) {
          this.productService.getBatchNumbersForProduct(newProd.sku).subscribe(batches => {
            this.batchNumbers[newProd.sku] = batches || [];
            if (batches && batches.length > 0) {
              // Keep the product's default batchNo consistent with server data
              newProd.batchNo = newProd.batchNo || batches[0].batchNumber;
              newProd.batch = newProd.batch || batches[0];
              newProd.retailPrice = newProd.retailPrice || batches[0].retailPrice || batches[0].unitCost;
            }
            // Add to product list so search/dropdown can find it immediately
            const exists = this.allProducts.find(p => (p.productId && newProd.productId && p.productId === newProd.productId) || (p.sku && newProd.sku && p.sku === newProd.sku));
            if (!exists) this.allProducts.unshift(newProd);
            // Re-run search to refresh dropdown results immediately
            this.searchProduct();
          }, err => {
            // On error fetching batches still add product to search data so it can be selected
            const exists = this.allProducts.find(p => (p.productId && newProd.productId && p.productId === newProd.productId) || (p.sku && newProd.sku && p.sku === newProd.sku));
            if (!exists) this.allProducts.unshift(newProd);
            this.searchProduct();
          });
        } else {
          // No SKU — still add to product source so the dropdown can show it
          const exists = this.allProducts.find(p => (p.productId && newProd.productId && p.productId === newProd.productId));
          if (!exists) this.allProducts.unshift(newProd);
          this.searchProduct();
        }
      }

      // Also refresh products list from server in background to keep cache fresh
      this.productService.getAllProducts().subscribe((data: Product[] = []) => {
        this.allProducts = data || this.allProducts;
        // If there is an active search term, refresh results (safe no-op if searchTerm is empty)
        if (this.productSearchTerm && this.productSearchTerm.trim().length > 0) {
          this.searchProduct();
        }
      }, err => {
        // ignore errors — we already updated local arrays for immediate UX
      });
    });
  }

  // Handler for adding a new batch for a product
  addNewBatch(product: Product): void {
    product.batchNo = '';
    product.cost = 0;
    // Optionally, you can open a dialog for batch details here
  }

  ngOnInit(): void {
    this.fetchSuppliers();
    this.productService.getAllProducts().subscribe(data => {
      this.allProducts = data;
    });
    // Set invoice date to current date (YYYY-MM-DD)
    const today = new Date();
    this.purchase.invoiceDate = today.toISOString().slice(0, 10);

    // Set default invoice number if not provided
    if (!this.purchase.invoiceNumber || this.purchase.invoiceNumber.trim() === '') {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const invoiceNum = `INV-${pad(today.getHours())}${pad(today.getMinutes())}${pad(today.getSeconds())}`;
      this.purchase.invoiceNumber = invoiceNum;
    }
  }

  fetchSuppliers(): void {
    this.supplierService.findAllSuppliers().subscribe(data => {
      this.suppliers = data;
      if (this.suppliers.length > 0) {
        this.selectedSupplierId = this.suppliers[0].supId ?? 0;
      }
    });
  }

  openPaymentDialog(): void {
    const totalCost = this.calculateTotalCost();
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: {
        maxAmount: totalCost,
        paidAmount: this.paidAmount
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.paidAmount = result.paymentAmount;
        this.paymentType = result.paymentType;
        this.chequeNumber = result.chequeNumber || '';
        this.bankName = result.bankName || '';
        this.chequeDate = result.chequeDate || '';
          this.createPurchase(); // Start loading
        // Navigation to invoice page will now happen only on successful API response inside createPurchase()
      }
    });
  }

  createPurchase(): void {
      this.isLoadingInvoice = true; // Set loading state
    const totalCost = this.calculateTotalCost();
    const paidAmount = this.paidAmount;
    const paymentType = this.paymentType;
    const isFullyPaid = paidAmount >= totalCost;
    const paymentStatus = isFullyPaid ? 'Paid' : 'Unpaid';
    const newPurchase: any = {
      purchaseName: this.purchase.purchaseName,
      invoiceNumber: this.purchase.invoiceNumber,
      deliveryTime: this.purchase.deliveryTime,
      invoiceDate: this.purchase.invoiceDate,
      paymentStatus: paymentStatus,
      paymentType: paymentType,
      products: this.purchase.products,
      supId: this.selectedSupplierId,
      totalCost: totalCost,
      paidAmount: paidAmount,
      isFullyPaid: isFullyPaid,
      chequeNumber: this.chequeNumber,
      bankName: this.bankName,
      chequeDate: this.chequeDate
    };
    this.purchaseService.createPurchase(newPurchase)
      .subscribe(response => {
        // Only reset form if not navigating to invoice
        // Navigation to invoice is now handled here on success
        const token = localStorage.getItem('token');
        let loggedUserName = '';
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            loggedUserName = payload.sub || '';
          } catch {}
        }
        const invoiceData = {
          invoiceNumber: this.purchase.invoiceNumber,
          currentDate: this.purchase.invoiceDate,
          selectedCustomerName: this.suppliers.find(s => s.supId === this.selectedSupplierId)?.name || '',
          loggedUserName,
          saleItems: this.purchase.products,
          billWiseDiscountPercentage: 0,
          saleItem: {
            paidAmount: this.paidAmount,
            isFullyPaid: this.paidAmount >= this.calculateTotalCost()
          },
          subtotal: this.calculateTotalCost(),
          totalDiscount: 0,
          billWiseDiscountTotal: 0,
          netTotal: this.calculateTotalCost()
        };
        // Instead of navigating to an invoice page, show a success dialog
        try {
          this.dialog.open(SuccessDialogComponent, {
            data: { message: 'Purchase created successfully.' }
          });
        } catch (e) {
          console.warn('Could not open success dialog', e);
        }
        this.isLoadingInvoice = false; // Reset loading state
        // Reset form after success
        const currentInvoiceDate = this.purchase.invoiceDate;
        this.purchase = new Purchase(0, '', '', '', '', '', [], 0, 0, false);
        this.purchase.invoiceDate = currentInvoiceDate;
        this.selectedSupplierId = 0;
        this.paidAmount = 0;
        this.paymentType = '';
        this.chequeNumber = '';
        this.bankName = '';
        this.chequeDate = '';
      }, error => {
        this.dialog.open(FailureDialogComponent, {
          data: { message: 'Error creating purchase ' }
        });
        console.error('Error creating purchase:', error);
          this.isLoadingInvoice = false; // Reset loading state on error
        // Reset payment fields so dialog starts fresh after failure
        this.paidAmount = 0;
        this.paymentType = '';
        this.chequeNumber = '';
        this.bankName = '';
        this.chequeDate = '';
        // Do NOT navigate to invoice page on error
      });
  }

  searchProduct(): void {
    if (!this.productSearchTerm || !this.allProducts || this.allProducts.length === 0) {
      this.searchResults = [];
      return;
    }

    const term = this.productSearchTerm.toLowerCase();
    const terms = term.split(/\s+/).filter(Boolean);
    this.searchResults = this.allProducts.filter(product => {
      // Basic fields
      const matchesBasic =
        (product.productName && product.productName.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.barCode && product.barCode.toLowerCase().includes(term));

      // Helper to match terms against vehicle object
      const matchVehicleObj = (v: any) => {
        if (!v) return false;
        // Match each term separately
        const termMatches = terms.every(t =>
          (v.make && v.make.toLowerCase().includes(t)) ||
          (v.model && v.model.toLowerCase().includes(t)) ||
          (v.year && v.year.toString().includes(t)) ||
          (product.productName && product.productName.toLowerCase().includes(t))
        );
        // Match combined string
        const combined = `${v.make || ''} ${v.model || ''} ${v.year || ''} ${product.productName || ''}`.toLowerCase();
        const combinedMatch = combined.includes(term);
        return termMatches || combinedMatch;
      };

      // Vehicle fields (single object)
      const matchesVehicleObj = matchVehicleObj(product.vehicle);

      return matchesBasic || matchesVehicleObj;
    });
  }

  addProductToPurchase(product: Product): void {
    if (!this.purchase.products.some(p => p.productId === product.productId)) {
      product.remainingQty = 1;
      product.wholeSalePrice = 0;
      // You may want to set product.cost and product.retailPrice from UI fields or defaults here
      if (typeof product.retailPrice === 'undefined' || product.retailPrice === null) {
        product.retailPrice = product.salePrice || 0;
      }
      if (!product.sku) return;
      this.productService.getBatchNumbersForProduct(product.sku).subscribe(batches => {
        this.batchNumbers[product.sku || 0] = batches;
        // Find existing batch
        const found = batches.find(batch => batch.unitCost === product.cost && batch.retailPrice === product.retailPrice);
        if (found) {
          product.batchNo = found.batchNumber;
        } else {
          const namePart = (product.productName || '').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
          const randPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
          product.batchNo = namePart + randPart;
        }
        this.purchase.products.push(product);
        console.log('Product added. Updated products:', this.purchase.products);
      });
    } else {
      console.log('Product already in list, not adding:', product);
    }
    this.searchResults = [];
    this.productSearchTerm = '';
  }
  

  removeProduct(product: Product): void {
    this.purchase.products = this.purchase.products.filter(p => p.productId !== product.productId);
  }

  onBatchChange(batchNumber: string, index: number): void {
    this.purchase.products[index].batchNo = batchNumber;
  }


  getBatchNumbers(product: Product): Batch[] {
    return this.batchNumbers[product.sku || 0] || [];
  }
  // Method to calculate the total cost of the purchase
  calculateTotalCost(): number {
    return this.purchase.products.reduce((total, product) => {
      return total + (product.cost || 0) * (product.remainingQty || 0);
    }, 0);
  }

  // Method to check if the selected batch is an existing batch
  isExistingBatch(batchNo: string): boolean {
    // Check if the batch number exists in any of the batch lists for any product
    return Object.values(this.batchNumbers).some(batches => 
      batches.some(batch => batch.batchNumber === batchNo)
    );
  }

  selectBatch(product: Product, batch: Batch): void {
    product.batchNo = batch.batchNumber;
    product.cost = batch.unitCost;  // Load existing unit cost
    // Set retail price from batch if available
    if (typeof batch.retailPrice !== 'undefined' && batch.retailPrice !== null) {
      product.retailPrice = batch.retailPrice;
    }
    this.isExistingBatch(product.batchNo);
  }

   // Method to change the selected tab
   selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  openCreateSupplierPopup() {
    const dialogRef = this.dialog.open(CreateSupplierComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      // If result is truthy, assume supplier was created and refresh supplier list
      if (result) {
        this.fetchSuppliers();
        console.log('Supplier created, refreshed supplier list');
      }
    });
  }


  validateBatch(product: Product): void {
    if (!product.sku) return;
    this.productService.getBatchNumbersForProduct(product.sku).subscribe((batches: Batch[]) => {
      this.batchNumbers[product.sku || 0] = batches;
      const found = batches.find((batch: Batch) => batch.unitCost === product.cost && batch.retailPrice === product.retailPrice);
      if (found) {
        product.batchNo = found.batchNumber;
      } else {
  const namePart = (product.productName || '').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
  const randPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  product.batchNo = namePart + randPart;
      }
    });
  }
}
