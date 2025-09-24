import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

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

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

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


  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredInventory = this.inventory.filter(item =>
        item.productName.toLowerCase().includes(query)
        || item.sku.toLowerCase().includes(query)
        || item.batchNo?.toLowerCase().includes(query)
      );
    } else {
      this.filteredInventory = this.inventory;
    }
    this.dropdownOpen = new Array(this.filteredInventory.length).fill(false);
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
}
