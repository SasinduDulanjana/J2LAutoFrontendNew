import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Router } from '@angular/router'; // Import Router
import { CreateProductComponent } from '../create-product/create-product.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  selectedProducts: number[] = []; // Array to store selected category IDs
  selectAll: boolean = false;
  categoryNames: { [key: number]: string } = {}; // Store fetched category names
  loading: boolean = false;

  constructor(private productService: ProductService, private categoryService: CategoryService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe(data => {
      this.products = data;
      this.filteredProducts = data;
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  //Filter values from Table
  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredProducts = this.products.filter(product => {
        // Basic fields
        const matchesBasic =
          (product.productName && product.productName.toLowerCase().includes(query)) ||
          (product.partNumber && product.partNumber.toLowerCase().includes(query)) ||
          (product.barCode && product.barCode.toLowerCase().includes(query)) ||
          (product.sku && product.sku.toLowerCase().includes(query)) ||
          (product.category?.name && product.category.name.toLowerCase().includes(query));

        // Vehicle fields
        const matchesVehicle = Array.isArray(product.vehicleList) && product.vehicleList.some((v: any) =>
          (v.make && v.make.toLowerCase().includes(query)) ||
          (v.model && v.model.toLowerCase().includes(query)) ||
          (v.year && v.year.toString().includes(query))
        );

        return matchesBasic || matchesVehicle;
      });
    } else {
      this.filteredProducts = this.products;
    }
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this product?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProduct(product).subscribe(
          () => {
            this.productService.getAllProducts().subscribe(
              (activeProducts: Product[]) => {
                this.products = activeProducts;
                this.filteredProducts = activeProducts;
              },
              error => {
                console.error('Error fetching active products:', error);
              }
            );
          },
          error => {
            console.error('Error deleting product', error);
          }
        );
      }
    });
  }

  editProduct(product: any): void {
    console.log('Product:', product);
    if (product?.productId) {
      this.router.navigate(['/edit-product', product.productId]);
    } else {
      console.error('Product ID is undefined or null.');
    }
  }


  openCreateProductPopup() {
    const dialogRef = this.dialog.open(CreateProductComponent, {
      width: '800px', // Adjust the width as needed
      data: {} // You can pass data to the dialog here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
      }
    });
  }

  navigateToCreateProduct() {
    this.router.navigate(['/create-product']);
  }
}
