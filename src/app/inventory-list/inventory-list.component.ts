import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  inventory: any[] = [];
  filteredInventory: any[] = [];
  searchQuery: string = '';
  dropdownOpen: boolean[] = [];
  loading: boolean = false;
  // categoryMap removed, use category from product object

  constructor(private productService: ProductService, private categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getAllProductsByBatchWise().subscribe(data => {
      this.inventory = data;
      this.filteredInventory = data;
      this.dropdownOpen = new Array(data.length).fill(false);
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }


  // onSearch(): void {
  //   const query = this.searchQuery.toLowerCase().trim();
  //   if (query) {
  //     this.filteredInventory = this.inventory.filter(item =>
  //       item.productName.toLowerCase().includes(query)
  //       || item.sku.toLowerCase().includes(query)
  //       || item.batchNo?.toLowerCase().includes(query)
  //     );
  //   } else {
  //     this.filteredInventory = this.inventory;
  //   }
  //   this.dropdownOpen = new Array(this.filteredInventory.length).fill(false);
  // }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      this.filteredInventory = this.inventory.filter(product => {
        // Basic fields
        const matchesBasic =
          (product.productName && product.productName.toLowerCase().includes(query)) ||
          (product.partNumber && product.partNumber.toLowerCase().includes(query)) ||
          (product.barCode && product.barCode.toLowerCase().includes(query)) ||
          (product.sku && product.sku.toLowerCase().includes(query)) ||
          (product.category?.name && product.category.name.toLowerCase().includes(query));

        // Helper to match terms against vehicle object
        const matchVehicleObj = (v: any) => {
          if (!v) return false;
          // Match each term separately
          const termMatches = terms.every(term =>
            (v.make && v.make.toLowerCase().includes(term)) ||
            (v.model && v.model.toLowerCase().includes(term)) ||
            (v.year && v.year.toString().includes(term)) ||
            (product.productName && product.productName.toLowerCase().includes(term))
          );
          // Match combined string
          const combined = `${v.make || ''} ${v.model || ''} ${v.year || ''} ${product.productName || ''}`.toLowerCase();
          const combinedMatch = combined.includes(query);
          return termMatches || combinedMatch;
        };

        // Vehicle fields (array)
        const matchesVehicleList = Array.isArray(product.vehicleList) && product.vehicleList.some((v: any) => matchVehicleObj(v));

        // Vehicle fields (single object)
        const matchesVehicleObj = matchVehicleObj(product.vehicle);

        return matchesBasic || matchesVehicleList || matchesVehicleObj;
      });
    } else {
      this.filteredInventory = this.inventory;
    }
  }

  isLowStock(item: any): boolean {
    const lowQtyNum = Number(item.lowQty);
    return this.getTotalQty(item) <= lowQtyNum;
  }

  toggleDropdown(idx: number): void {
    this.dropdownOpen[idx] = !this.dropdownOpen[idx];
  }

  getTotalQty(item: any): number {
    if (item.batchQuantities && item.batchQuantities.length > 0) {
      return item.batchQuantities.reduce((sum: number, batch: any) => sum + (batch.qty || 0), 0);
    }
    return 0;
  }

    editProduct(product: any): void {
    console.log('Product:', product);
    if (product?.productId) {
      this.router.navigate(['/edit-product', product.productId]);
    } else {
      console.error('Product ID is undefined or null.');
    }
  }
}
