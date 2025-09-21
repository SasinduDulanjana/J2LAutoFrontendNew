import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  skuExists: boolean = false;
  barcodeExists: boolean = false;
  // category: any = {};
  productId!: number;
  products: Product[] = [];
  selectedParentCategoryId: number = 0;
  categoryId!: number;
  categories: Category[] = [];
  category: Category = new Category('', '');
  product: Product = new Product(0, '', false, "", "", "", "", "", "", false, 0, 0, 0, 0, "", false, "", "", "", "", "", 0, false, false, false, 0); // Initialize with empty values or defaults

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.productId = idParam ? +idParam : 0; // Handle null value
      if (this.productId) {
        this.productService.getProductById(this.productId).subscribe(data => {
          this.product = data;
          this.selectedParentCategoryId = data.catId ?? 0;
        });
      } else {
        console.error('Invalid category ID');
      }
    });
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }


  onSkuChange(sku: string) {
    if (!sku || sku.length < 2) {
      this.skuExists = false;
      return;
    }
    this.productService.searchProductBySkuOrBarcode(sku).subscribe(
      (existingProduct) => {
        // Don't count current product's SKU as duplicate
        this.skuExists = !!(existingProduct && existingProduct.sku === sku && existingProduct.productId !== this.productId);
      },
      (error: any) => {
        this.skuExists = false;
      }
    );
  }

  onBarcodeChange(barcode: string) {
    if (!barcode || barcode.length < 3) {
      this.barcodeExists = false;
      return;
    }
    this.productService.searchProductBySkuOrBarcode(barcode).subscribe(
      (existingProduct) => {
        // Don't count current product's barcode as duplicate
        this.barcodeExists = !!(existingProduct && existingProduct.barCode === barcode && existingProduct.productId !== this.productId);
      },
      (error: any) => {
        this.barcodeExists = false;
      }
    );
  }

  saveProduct(): void {
    const updatedProduct = {
      productId: this.productId,
      catId: this.selectedParentCategoryId,
      productName: this.product.productName,
      isBarCodeAvailable: this.product.isBarCodeAvailable,
      barCode: this.product.barCode,
      sku: this.product.sku,
      barCodeType: this.product.barCodeType,
      productType: this.product.productType,
      productStatus: this.product.productStatus,
      description: this.product.description,
      isStockManagementEnable: this.product.isStockManagementEnable,
      cost: this.product.cost,
      retailPrice: this.product.retailPrice,
      salePrice: this.product.salePrice,
      wholeSalePrice: this.product.wholeSalePrice,
      lowQty: this.product.lowQty,
      isExpDateAvailable: this.product.isExpDateAvailable,
      expDate: this.product.expDate,
      taxGroup: this.product.taxGroup,
      taxType: this.product.taxType,
      imgUrl: this.product.imgUrl,
      batchNo: this.product.batchNo,
      status: this.product.status,
      stockManagementEnable: this.product.stockManagementEnable,
      barCodeAvailable: this.product.barCodeAvailable,
      expDateAvailable: this.product.expDateAvailable,
      remainingQty: this.product.remainingQty
    };
    if (this.skuExists) {
      this.dialog.open(FailureDialogComponent, {
        data: { message: 'SKU already exists. Please enter a unique SKU.' },
        panelClass: 'failure-dialog-panel'
      });
      return;
    }
    if (this.barcodeExists) {
      this.dialog.open(FailureDialogComponent, {
        data: { message: 'Barcode already exists. Please enter a unique Barcode.' },
        panelClass: 'failure-dialog-panel'
      });
      return;
    }
    this.productService.updateProduct(updatedProduct)
      .subscribe({
        next: (response) => {
          const dialogRef = this.dialog.open(SuccessDialogComponent, {
            data: { message: 'Product updated successfully!' },
            panelClass: 'success-dialog-panel'
          });
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/product-list']); // Redirect after success
          });
        },
        error: (error) => {
          let message = 'Failed to update product.';
          if (error.status === 500) {
            message = 'This product cannot be updated because it has associated sales or is restricted by business rules.';
          } else if (error?.error?.message) {
            message = error.error.message;
          }
          this.dialog.open(FailureDialogComponent, {
            data: { message },
            panelClass: 'failure-dialog-panel'
          });
          console.error('Error updating product:', error);
        }
      });
  }

}
