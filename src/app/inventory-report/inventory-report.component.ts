


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
    this.productService.getAllProductsByBatchWise().subscribe({
      next: (products: any[]) => {
        // Ensure each product has a vehicle object
        this.inventory = products.map(item => {
          if (!item.vehicle && (item.make || item.model || item.year)) {
            item.vehicle = {
              make: item.make || '-',
              model: item.model || '-',
              year: item.year || '-'
            };
          }
          return item;
        });
        this.filteredInventory = this.inventory;
        this.dropdownOpen = new Array(this.inventory.length).fill(false);
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to fetch inventory.';
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

  // onSearch(): void {
  //   const query = this.searchQuery.toLowerCase().trim();
  //   if (query) {
  //     this.filteredInventory = this.inventory.filter(item => {
  //       const productMatch = item.productName && item.productName.toLowerCase().includes(query);
  //       const skuMatch = item.sku && item.sku.toLowerCase().includes(query);
  //       const categoryName = item.category?.name || this.getCategoryName(item.catId);
  //       const categoryMatch = categoryName && categoryName.toLowerCase().includes(query);
  //       return productMatch || skuMatch || categoryMatch;
  //     });
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

        // Vehicle fields (single object)
        const matchesVehicleObj = matchVehicleObj(product.vehicle);

        return matchesBasic || matchesVehicleObj;
      });
    } else {
      this.filteredInventory = this.inventory;
    }
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
      'Make & Model',
      'Year',
      // 'SKU',
      // 'Category',
      'Batch No',
      'Batch Qty',
      'Cost',
      'Retail Price',
      // 'Wholesale Price',
      'Low Stock Alert'
    ]];
    let data: any[] = [];
    let totalCostValue = 0;
    let totalRetailValue = 0;
    (this.filteredInventory || []).forEach((item: any) => {
      const categoryName = item.category?.name || this.getCategoryName(item.catId);
      // Only include items that have batches with qty > 0. Skip items with no batches or zero quantities.
      if (Array.isArray(item.batchQuantities) && item.batchQuantities.length > 0) {
        const validBatches = item.batchQuantities.filter((b: any) => Number(b.qty ?? 0) > 0);
        if (validBatches.length === 0) {
          // skip item entirely if no positive-qty batches
          return;
        }
        validBatches.forEach((batch: any) => {
          const qty = Number(batch.qty ?? 0) || 0;
          const cost = Number(batch.cost ?? item.cost ?? 0) || 0;
          const retail = Number(batch.retailPrice ?? item.retailPrice ?? item.salePrice ?? 0) || 0;
          // accumulate totals
          totalCostValue += qty * cost;
          totalRetailValue += qty * retail;
          data.push([
            item.productName || '',
            `${item.vehicle?.make || '-'} ${item.vehicle?.model || '-'}`,
            item.vehicle?.year || '-',
            // item.sku || '',
            // categoryName,
            batch.batchNo ?? '',
            qty,
            cost !== undefined ? cost.toFixed(2) : '-',
            retail !== undefined ? retail.toFixed(2) : '-',
            // batch.wholesalePrice !== undefined ? Number(batch.wholesalePrice).toFixed(2) : '-',
            this.isLowStock(item) ? 'Low' : 'OK'
          ]);
        });
      } else {
        // No batches -> skip from PDF as requested
        return;
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
    // Add totals below the table
    // lastAutoTable.finalY gives the vertical position after the table
    // (may be undefined if autoTable isn't present in typings)
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 22;
    const nextY = (finalY || 22) + 8;
    doc.setFontSize(12);
    doc.text('Totals (shown items only):', 14, nextY);
    doc.setFontSize(11);
    doc.text(`Total cost value: ${Number(totalCostValue).toFixed(2)}`, 14, nextY + 8);
    doc.text(`Total retail value: ${Number(totalRetailValue).toFixed(2)}`, 14, nextY + 16);
    doc.save('inventory-report.pdf');
  }

  /**
   * Calculate total stock value (cost basis) for the current inventory set.
   * Uses batch.cost when available, otherwise falls back to product.cost.
   */
  getInventoryStockValue(useFiltered: boolean = true): number {
    const list = useFiltered ? this.filteredInventory : this.inventory;
    if (!list || list.length === 0) return 0;
    return list.reduce((total: number, item: any) => {
      // If batchQuantities available, use per-batch cost * qty
      if (item.batchQuantities && Array.isArray(item.batchQuantities) && item.batchQuantities.length > 0) {
        const batchSum = item.batchQuantities.reduce((s: number, batch: any) => {
          const qty = Number(batch.qty ?? 0) || 0;
          const cost = Number(batch.cost ?? item.cost ?? 0) || 0;
          return s + qty * cost;
        }, 0);
        return total + batchSum;
      }

      // Otherwise use remainingQty * item.cost as fallback
      const qty = Number(item.remainingQty ?? 0) || 0;
      const cost = Number(item.cost ?? 0) || 0;
      return total + qty * cost;
    }, 0);
  }

  /**
   * Calculate total sale/retail value for the current inventory set.
   * Uses batch.retailPrice when available, otherwise falls back to item.retailPrice or item.salePrice.
   */
  getInventorySaleValue(useFiltered: boolean = true): number {
    const list = useFiltered ? this.filteredInventory : this.inventory;
    if (!list || list.length === 0) return 0;
    return list.reduce((total: number, item: any) => {
      if (item.batchQuantities && Array.isArray(item.batchQuantities) && item.batchQuantities.length > 0) {
        const batchSum = item.batchQuantities.reduce((s: number, batch: any) => {
          const qty = Number(batch.qty ?? 0) || 0;
          const price = Number(batch.retailPrice ?? item.retailPrice ?? item.salePrice ?? 0) || 0;
          return s + qty * price;
        }, 0);
        return total + batchSum;
      }
      const qty = Number(item.remainingQty ?? 0) || 0;
      const price = Number(item.retailPrice ?? item.salePrice ?? 0) || 0;
      return total + qty * price;
    }, 0);
  }
}
