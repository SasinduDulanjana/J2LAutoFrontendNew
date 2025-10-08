import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
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
  loading: boolean = false;
  skuExists: boolean = false;
  barcodeExists: boolean = false;
  productId!: number;
  products: Product[] = [];
  selectedParentCategoryId: number = 0;
  categoryId!: number;
  categories: Category[] = [];
  category: Category = new Category('', '');
  product: Product = new Product(0, '', false, "", "", "", "", "", "", false, 0, 0, 0, 0, "", false, "", "", "", "", "", 0, false, false, false, 0);
  vehicleModels: any[] = [];
  selectedVehicleId: number | null = null;
  selectedVehicles: any[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Load categories
    // this.categoryService.getAllCategories().subscribe(data => {
    //   this.categories = data;
    // });
    // Load vehicles first
    this.vehicleService.getAllVehicles().subscribe(vehicleData => {
      this.vehicleModels = (vehicleData || []).sort((a, b) => {
        const aStr = `${a.make} ${a.model} ${a.year}`.toLowerCase();
        const bStr = `${b.make} ${b.model} ${b.year}`.toLowerCase();
        return aStr.localeCompare(bStr);
      });
      // Now load product
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        this.productId = idParam ? +idParam : 0;
        if (this.productId) {
          this.productService.getProductById(this.productId).subscribe(data => {
            this.product = data;
            this.selectedParentCategoryId = data.category?.catId ?? data.catId ?? 0;
            this.product.brandName = data.brandName ?? '';
            this.product.partNumber = data.partNumber ?? '';
            // Vehicle selection: handle vehicle (object), vehicleList (array), vehicleModelIds (array)
            const vehicleObj = (data as any).vehicle;
            const vehicleList = (data as any).vehicleList;
            const vehicleModelIds = (data as any).vehicleModelIds;
            let compatibleVehicleId: number | null = null;
            if (vehicleObj && typeof vehicleObj === 'object' && vehicleObj.id) {
              // If vehicle object exists, set selectedVehicles and selectedVehicleId
              const found = this.vehicleModels.find(vm => vm.id === vehicleObj.id);
              if (found) {
                this.selectedVehicles = [found];
                compatibleVehicleId = found.id;
              } else {
                this.selectedVehicles = [];
                compatibleVehicleId = null;
              }
            } else if (Array.isArray(vehicleList) && vehicleList.length) {
              this.selectedVehicles = vehicleList;
              const found = vehicleList.find(vl => this.vehicleModels.some(vm => vm.id === vl.id));
              compatibleVehicleId = found ? found.id : null;
            } else if (Array.isArray(vehicleModelIds) && vehicleModelIds.length && this.vehicleModels.length) {
              this.selectedVehicles = this.vehicleModels.filter(vm => vehicleModelIds?.includes(vm.id));
              const found = vehicleModelIds.find(id => this.vehicleModels.some(vm => vm.id === id));
              compatibleVehicleId = found ?? null;
            } else {
              this.selectedVehicles = [];
              compatibleVehicleId = null;
            }
            this.selectedVehicleId = compatibleVehicleId;
            // Pre-fill the vehicle search bar with the first compatible vehicle
            if (this.selectedVehicles.length > 0) {
              const v = this.selectedVehicles[0];
              this.vehicleSearchTerm = `${v.make} ${v.model} ${v.year}`;
            } else {
              this.vehicleSearchTerm = '';
            }
            this.loading = false;
          }, error => {
            this.loading = false;
          });
        } else {
          this.loading = false;
          console.error('Invalid category ID');
        }
      });
    });
  }

  addVehicle(): void {
    if (this.selectedVehicleId) {
      const found = this.vehicleModels.find(v => v.id === this.selectedVehicleId);
      if (found && !this.selectedVehicles.some(v => v.id === found.id)) {
        this.selectedVehicles.push(found);
      }
    }
  }

  removeVehicle(index: number): void {
    this.selectedVehicles.splice(index, 1);
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
      brandName: this.product.brandName,
      partNumber: this.product.partNumber,
      vehicle: this.vehicleModels.find(vm => vm.id === this.selectedVehicleId) || null,
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
    this.loading = true;
    this.productService.updateProduct(updatedProduct)
      .subscribe({
        next: (response) => {
          this.loading = false;
          const dialogRef = this.dialog.open(SuccessDialogComponent, {
            data: { message: 'Product updated successfully!' },
            panelClass: 'success-dialog-panel'
          });
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/inventory-list']); // Redirect after success
          });
        },
        error: (error) => {
          this.loading = false;
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
