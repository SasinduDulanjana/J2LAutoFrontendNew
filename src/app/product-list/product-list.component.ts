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

  constructor(private productService: ProductService, private categoryService: CategoryService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(data => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  //Filter values from Table
  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredProducts = this.products.filter(product =>
        product.productName.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  // onSelect(productId: number): void {
  //   const index = this.selectedProducts.indexOf(productId);
  //   if (index > -1) {
  //     this.selectedProducts.splice(index, 1);
  //   } else {
  //     this.selectedProducts.push(productId);
  //   }
  // }

  // onSelectAll(): void {
  //   if (this.selectAll) {
  //     this.selectedProducts = this.filteredProducts.map(product => product.id);
  //   } else {
  //     this.selectedProducts = [];
  //   }
  // }

  // isSelected(productId: number): boolean {
  //   return this.selectedProducts.includes(productId);
  // }

  // deleteSelected(): void {
  //   if (confirm('Are you sure you want to delete the selected products?')) {
  //     // Call the service to delete selected categories
  //     this.productService.deleteProducts(this.selectedProducts).subscribe(
  //       () => {
  //         // Remove deleted products from the list
  //         this.products = this.products.filter(product =>
  //           !this.selectedProducts.includes(product.id)
  //         );
  //         this.filteredProducts = this.filteredProducts.filter(product=>
  //           !this.selectedProducts.includes(product.id)
  //         );
  //         this.selectedProducts = [];
  //         this.selectAll = false;
  //       },
  //       error => {
  //         console.error('Error deleting products', error);
  //       }
  //     );
  //   }
  // }

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

  getCategoryName(catId: number | null): string {
    if (!catId || catId == 0) {
      return 'No Category';
    }
    if (this.categoryNames[catId]) {
      return this.categoryNames[catId];
    }
    this.categoryService.getCategoryById(catId).subscribe(
      category => {
        this.categoryNames[catId] = category.name;
      },
      error => {
        console.error('Error fetching category:', error);
        this.categoryNames[catId] = 'Unknown Category';
      }
    );
    return 'Loading...';
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
