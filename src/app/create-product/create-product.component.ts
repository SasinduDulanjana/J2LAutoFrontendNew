import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service'; // Correct path to the service
import { Product } from '../models/product.model'; // Correct path to the model
import { CategoryService } from '../services/category.service'; // Correct path to the service
import { Category } from '../models/category.model'; // Correct path to the model
import { CreateCategoryComponent } from '../create-category/create-category.component';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';


@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit{
  // skuExists already declared below
  barcodeExists: boolean = false;
  skuExists: boolean = false;
  skuCheckInProgress: boolean = false;

  loading: boolean = false;

  products: Product[] = [];
  categories: Category[] = [];
  selectedParentCategoryId: number = 0;
  product: Product = new Product(0, '', false, "", "", "", "", "", "", false, 0, 0, 0, 0, "", false, "", "", "", "", "", 0, false, false, false, 0); // Initialize with empty values or defaults
  selectedTab: number = 1;
  isDropdownVisibleProductType: boolean = false;
  isDropdownVisibleProductStatus: boolean = false;
  isDropdownVisibleTaxGroup: boolean = false;
  isDropdownVisibleTaxType: boolean = false;
  constructor(private productService: ProductService,private categoryService: CategoryService,private dialog: MatDialog) { }

  onSkuChange(sku: string) {
    if (!sku || sku.length < 2) {
      this.skuExists = false;
      return;
    }
    this.productService.searchProductBySkuOrBarcode(sku).subscribe(
      (existingProduct) => {
        this.skuExists = !!(existingProduct && existingProduct.sku === sku);
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
        this.barcodeExists = !!(existingProduct && existingProduct.barCode === barcode);
      },
      (error: any) => {
        this.barcodeExists = false;
      }
    );
  }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }
  
  createProduct(): void {
    if (this.skuExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'SKU already exists. Please enter a unique SKU.' }
      });
      return;
    }
    if (this.barcodeExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Barcode already exists. Please enter a unique Barcode.' }
      });
      return;
    }
    const newProduct = {
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
    this.loading = true;
    this.productService.createProduct(newProduct)
      .subscribe(response => {
        this.loading = false;
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          width: '350px',
          data: { message: 'Product created successfully!' }
        });
        dialogRef.afterClosed().subscribe(() => {
          // Reset the form fields
          this.product = new Product(0, '', false, '', '', '', '', '', '', false, 0, 0, 0, 0, '', false, '', '', '', '', '', 0, false, false, false, 0);
          this.selectedParentCategoryId = 0;
        });
      }, error => {
        this.loading = false;
        console.error('Error creating product:', error);
      });
  // Removed stray statement and duplicate logic
  // ...existing code...
  }

  // Method to change the selected tab
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  openCreateCategoryPopup() {
    const dialogRef = this.dialog.open(CreateCategoryComponent, {
      width: '800px', // Adjust the width as needed
      data: {} // You can pass data to the dialog here if needed
    });
  }
}
