


import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
// import { Batch } from '../models/batch.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.scss']
})
export class InventoryReportComponent {
  isLowStock(item: Product): boolean {
    const lowQtyNum = Number(item.lowQty);
    return item.remainingQty != null && !isNaN(lowQtyNum) && item.remainingQty <= lowQtyNum;
  }
  inventory: Product[] = [];
  filteredInventory: Product[] = [];
  currentStockMap: { [key: string]: number | null } = {}; // key: sku|batchNo
  searchQuery: string = '';
  loading: boolean = false;
  error: string = '';
  categories: Category[] = [];
  dropdownOpen: boolean[] = [];

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.fetchCategoriesAndInventory();
  }

  fetchCategoriesAndInventory(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.productService.getAllProductsByBatchWise().subscribe({
          next: (products: any[]) => {
            this.inventory = products;
            this.filteredInventory = products;
            this.dropdownOpen = new Array(products.length).fill(false);
            this.loading = false;
          },
          error: err => {
            this.error = 'Failed to fetch inventory.';
            this.loading = false;
          }
        });
      },
      error: err => {
        this.error = 'Failed to fetch categories.';
        this.loading = false;
      }
    });
  }

  getStockKey(item: Product): string {
    return `${item.sku}|${item.batchNo}`;
  }

  getCurrentStock(item: Product): number | null {
    const key = this.getStockKey(item);
    return this.currentStockMap[key];
  }

  getCategoryName(catId: number): string {
    const cat = this.categories.find(c => c.catId === catId);
    return cat ? cat.name : '';
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredInventory = this.inventory.filter(item =>
        (item.productName && item.productName.toLowerCase().includes(query)) ||
        (item.sku && item.sku.toLowerCase().includes(query))
      );
    } else {
      this.filteredInventory = this.inventory;
    }
    this.dropdownOpen = new Array(this.filteredInventory.length).fill(false);
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

  exportToPDF(): void {
    console.log('Exporting PDF...');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Inventory Report', 14, 16);
    const head = [[
      'Product',
      'SKU',
      'Category',
      'Batch No',
      'Batch Qty',
      'Cost',
      'Retail Price',
      // 'Wholesale Price',
      'Low Stock Alert'
    ]];
    let data: any[] = [];
    (this.filteredInventory || []).forEach((item: any) => {
      if (Array.isArray(item.batchQuantities) && item.batchQuantities.length > 0) {
        item.batchQuantities.forEach((batch: any) => {
          data.push([
            item.productName || '',
            item.sku || '',
            this.getCategoryName(item.catId),
            batch.batchNo ?? '',
            batch.qty ?? 0,
            batch.cost !== undefined ? Number(batch.cost).toFixed(2) : '-',
            batch.retailPrice !== undefined ? Number(batch.retailPrice).toFixed(2) : '-',
            // batch.wholesalePrice !== undefined ? Number(batch.wholesalePrice).toFixed(2) : '-',
            this.isLowStock(item) ? 'Low' : 'OK'
          ]);
        });
      } else {
        data.push([
          item.productName || '',
          item.sku || '',
          this.getCategoryName(item.catId),
          '-',
          '-',
          '-',
          '-',
          '-',
          this.isLowStock(item) ? 'Low' : 'OK'
        ]);
      }
    });
    autoTable(doc, {
      head,
      body: data,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      margin: { left: 8, right: 8 }
    });
    doc.save('inventory-report.pdf');
  }
}
