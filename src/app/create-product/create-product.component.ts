import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service'; // Correct path to the service
import { Product } from '../models/product.model'; // Correct path to the model
import { CategoryService } from '../services/category.service'; // Correct path to the service
import { VehicleService } from '../services/vehicle.service'; // Correct path to the service
import { Category } from '../models/category.model'; // Correct path to the model
import { CreateCategoryComponent } from '../create-category/create-category.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';


@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit{
  vehicleSearchTerm: string = '';
  vehicleModelResults: any[] = [];
  searchVehicleModel(): void {
    const term = this.vehicleSearchTerm?.toLowerCase().trim() || '';
    if (!term) {
      this.vehicleModelResults = [];
      return;
    }
    // Split term for multi-field matching
    const parts = term.split(/\s+/);
    this.vehicleModelResults = this.vehicleModels.filter(v => {
      const make = (v.make || '').toLowerCase();
      const model = (v.model || '').toLowerCase();
      const year = String(v.year || '').toLowerCase();
      // Match all parts in any order
      return parts.every(p => make.includes(p) || model.includes(p) || year.includes(p));
    });
  }

  selectVehicleModel(vehicle: any): void {
    this.selectedVehicleId = vehicle.id;
    this.vehicleSearchTerm = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
    this.vehicleModelResults = [];
    // Optionally add to selectedVehicles array if multi-select is needed
    // this.selectedVehicles.push(vehicle);
  }
  openCreateVehiclePopup(): void {
    const dialogRef = this.dialog.open(
      // @ts-ignore
      (window as any).ng?.components?.CreateVehicleComponent || (window as any).CreateVehicleComponent || require('../create-vehicle/create-vehicle.component').CreateVehicleComponent,
      {
        width: '500px',
        disableClose: false
      }
    );
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.vehicle) {
        // Refresh vehicle list and sort alphabetically
        this.vehicleService.getAllVehicles().subscribe(data => {
          this.vehicleModels = (data || []).sort((a, b) => {
            const aStr = `${a.make} ${a.model} ${a.year}`.toLowerCase();
            const bStr = `${b.make} ${b.model} ${b.year}`.toLowerCase();
            return aStr.localeCompare(bStr);
          });
        });
      }
    });
  }
  selectedVehicleId: number | null = null;
  selectedVehicles: any[] = [];
  // skuExists already declared below
  barcodeExists: boolean = false;
  // SKU is auto-generated, not user input

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
  vehicleModels: any[] = [];
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private vehicleService: VehicleService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }


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
    // Fetch vehicle models from backend API
    this.vehicleService.getAllVehicles().subscribe(data => {
      this.vehicleModels = (data || []).sort((a, b) => {
        const aStr = `${a.make} ${a.model} ${a.year}`.toLowerCase();
        const bStr = `${b.make} ${b.model} ${b.year}`.toLowerCase();
        return aStr.localeCompare(bStr);
      });
      // Set first vehicle as default selection if available
      this.selectedVehicleId = this.vehicleModels.length > 0 ? this.vehicleModels[0].id : null;
    });
    this.selectedVehicles = [];
  // Auto-generate SKU (timestamp + random string for uniqueness)
  this.product.sku = 'SKU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  addVehicle(): void {
    if (this.selectedVehicleId) {
      const found = this.vehicleModels.find(v => v.id === this.selectedVehicleId);
      if (found && !this.selectedVehicles.some(v => v.id === found.id)) {
        this.selectedVehicles.push(found);
        // Sync selected vehicle IDs to product model
        this.product.vehicleModelIds = this.selectedVehicles.map(v => v.id);
      }
      this.selectedVehicleId = null;
    }
  }

  removeVehicle(index: number): void {
  this.selectedVehicles.splice(index, 1);
  // Sync selected vehicle IDs to product model
  this.product.vehicleModelIds = this.selectedVehicles.map(v => v.id);
  }
  
  createProduct(): void {
    // SKU is auto-generated, no need to check existence
    if (this.barcodeExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Barcode already exists. Please enter a unique Barcode.' }
      });
      return;
    }
    let selectedVehicle = null;
    if (this.selectedVehicleId !== null && Array.isArray(this.vehicleModels)) {
      const found = this.vehicleModels.find(v => v.id === this.selectedVehicleId);
      if (found) selectedVehicle = found;
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
      remainingQty: this.product.remainingQty,
      brandName: this.product.brandName,
      partNumber: this.product.partNumber,
      vehicle: selectedVehicle
    };
    console.log('Product creation payload:', newProduct);
    console.log('Product creation payload:', newProduct);
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
          this.selectedVehicles = [];
          // Set first vehicle as default selection after save/reset
          this.selectedVehicleId = this.vehicleModels.length > 0 ? this.vehicleModels[0].id : null;
          // Regenerate SKU for next product
          this.product.sku = 'SKU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
          // Clear compatible vehicle model search bar
          this.vehicleSearchTerm = '';
        });
      }, error => {
        this.loading = false;
        // Always show the raw backend error response
        let errorMsg = '';
        if (typeof error?.error === 'string') {
          errorMsg = error.error;
        } else if (error?.error) {
          errorMsg = error.error.message || JSON.stringify(error.error);
        } else if (error?.message) {
          errorMsg = error.message;
        }
        if (!errorMsg) {
          errorMsg = 'Failed to create product. Please try again.';
        }
        this.dialog.open(FailureDialogComponent, {
          width: '350px',
          data: { message: errorMsg }
        });
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
