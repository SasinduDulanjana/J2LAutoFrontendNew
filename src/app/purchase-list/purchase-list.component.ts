import { BASE_URL } from '../base-url';
// Minimal interface for purchase list items
interface PurchaseListItem {
  purchaseId?: number;
  supId?: number;
  supplierId?: number;
  supplierName?: string;
  purchaseName?: string;
  invoiceNumber?: string;
}
// Minimal interface for purchase list items
interface PurchaseListItem {
  purchaseId?: number;
  supId?: number;
  supplierId?: number;
  supplierName?: string;
  purchaseName?: string;
  invoiceNumber?: string;
  [key: string]: any;
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PurchaseService } from '../services/purchase.service';
import { SupplierService } from '../services/supplier.service';
import { PurchaseListStateService } from '../services/purchase-list-state.service';
import { Purchase } from '../models/purchase.model';
import { Supplier } from '../models/supplier.model';
import { ViewProductsDialogComponent } from './view-products-dialog.component';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent implements OnInit {
  loadingProducts: boolean = false;
  loading: boolean = false;
  goToPaymentDetails(purchase: PurchaseListItem) {
    // Save the current search state before navigating
    this.purchaseListStateService.saveState(
      this.searchQuery,
      this.filteredPurchases,
      this.currentPage,
      this.isSearching,
      this.allPurchasesData,
      this.totalPages,
      this.totalCount,
      this.suppliers
    );
    const id = purchase.purchaseId ?? purchase.supId ?? 0;
    this.router.navigate(['/purchase-payment-details', id]);
  }
  purchases: PurchaseListItem[] = [];
  filteredPurchases: PurchaseListItem[] = [];
  allPurchasesData: PurchaseListItem[] = [];
  searchQuery: string = '';
  isSearching: boolean = false;
  suppliers: Supplier[] = [];

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private router: Router,
    private dialog: MatDialog,
    private purchaseListStateService: PurchaseListStateService
  ) {}

  ngOnInit(): void {
    // First, fetch suppliers
    this.supplierService.findAllSuppliers().subscribe({
      next: (suppliers: Supplier[]) => {
        console.log('Suppliers loaded:', suppliers);
        this.suppliers = suppliers;

        // Then check if we have a saved search state to restore
        if (this.purchaseListStateService.hasState()) {
          const savedState = this.purchaseListStateService.getState();
          this.searchQuery = savedState.searchQuery;
          this.filteredPurchases = savedState.filteredPurchases;
          this.currentPage = savedState.currentPage;
          this.isSearching = savedState.isSearching;
          this.allPurchasesData = savedState.allPurchasesData;
          this.totalPages = savedState.totalPages;
          this.totalCount = savedState.totalCount;
          this.loading = false;
          console.log('Search state restored:', this.searchQuery);
        } else {
          // Load purchases normally if no saved state
          this.loadPurchases();
        }
      },
      error: err => {
        console.error('Error loading suppliers:', err);
        this.loading = false;
      }
    });
  }

  loadPurchases(page: number = 0): void {
    this.loading = true;
    this.isSearching = false;
    this.currentPage = page;
    // Fetch suppliers first
    this.supplierService.findAllSuppliers().subscribe({
      next: (suppliers: Supplier[]) => {
        console.log('Suppliers loaded:', suppliers);
        this.suppliers = suppliers;
        // Now fetch purchases with pagination
        this.purchaseService.getAllPurchasesPaginated(page, this.pageSize).subscribe({
          next: (data: any[]) => {
            console.log('Purchases loaded:', data);
            this.purchases = data.map(p => {
              // Fallback: if supplierId is missing, just show purchase without supplierName
              const supId = p.supplierId ?? p.supId ?? null;
              // Map total cost and paid amount from possible backend field names
              const totalCost = p.totalCost ?? p.total_cost ?? 0;
              const paidAmount = p.paidAmount ?? p.paid_amount ?? 0;
              return {
                ...p,
                supId,
                supplierName: supId ? this.getSupplierName(supId) : '',
                totalCost,
                paidAmount
              };
            })
            // Sort by purchaseId (latest to oldest)
            .sort((a, b) => {
              const idA = Number(a.purchaseId ?? a.id ?? 0);
              const idB = Number(b.purchaseId ?? b.id ?? 0);
              return idB - idA;
            });
            console.log('Mapped purchases:', this.purchases);
            this.filteredPurchases = [...this.purchases];
            this.allPurchasesData = [...this.purchases];
            
            // Calculate total pages (estimate based on page size)
            if (page === 0 && data.length > 0) {
              this.totalCount = data.length >= this.pageSize ? this.pageSize * 10 : data.length;
              this.totalPages = Math.ceil(this.totalCount / this.pageSize);
            }
            this.loading = false;
          },
          error: err => {
            console.error('Error loading purchases:', err);
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error('Error loading suppliers:', err);
        this.loading = false;
      }
    });
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.supId === supplierId);
    return supplier ? supplier.name : '';
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.loading = true;
      this.isSearching = true;
      // Fetch all purchases without pagination for searching
      this.purchaseService.getAllPurchasesWithoutPagination().subscribe((allPurchases: any[]) => {
        const filtered = allPurchases.filter((purchase: any) => {
          const supplierName = purchase.supplierId ? this.getSupplierName(purchase.supplierId) : '';
          return (
            (purchase.purchaseName && purchase.purchaseName.toLowerCase().includes(query)) ||
            (purchase.invoiceNumber && purchase.invoiceNumber.toLowerCase().includes(query)) ||
            (supplierName && supplierName.toLowerCase().includes(query))
          );
        });
        
        // Set filtered purchases and reset pagination
        this.filteredPurchases = filtered.map(p => {
          const supId = p.supplierId ?? p.supId ?? null;
          const totalCost = p.totalCost ?? p.total_cost ?? 0;
          const paidAmount = p.paidAmount ?? p.paid_amount ?? 0;
          return {
            ...p,
            supId,
            supplierName: supId ? this.getSupplierName(supId) : '',
            totalCost,
            paidAmount
          };
        })
        // Sort by purchaseId (latest to oldest)
        .sort((a, b) => {
          const idA = Number(a.purchaseId ?? a.id ?? 0);
          const idB = Number(b.purchaseId ?? b.id ?? 0);
          return idB - idA;
        });
        
        this.allPurchasesData = this.filteredPurchases; // Keep all filtered data for pagination
        this.currentPage = 0;
        this.totalCount = this.filteredPurchases.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        
        // Save search state after successful search
        this.purchaseListStateService.saveState(
          this.searchQuery,
          this.filteredPurchases,
          this.currentPage,
          this.isSearching,
          this.allPurchasesData,
          this.totalPages,
          this.totalCount,
          this.suppliers
        );
      }, error => {
        console.error('Error searching purchases:', error);
        this.loading = false;
      });
    } else {
      // Reset to paginated view
      this.isSearching = false;
      this.purchaseListStateService.clearState();
      this.loadPurchases(0);
    }
  }

  /**
   * Calculate totals for purchases displayed (filtered by search) or all purchases.
   */
  getTotalPurchasesCost(useFiltered: boolean = true): number {
    const list = useFiltered ? this.filteredPurchases : this.purchases;
    if (!list || list.length === 0) return 0;
    return list.reduce((sum: number, p: any) => sum + (Number(p.totalCost ?? p.total_cost ?? 0) || 0), 0);
  }

  getTotalPaidAmount(useFiltered: boolean = true): number {
    const list = useFiltered ? this.filteredPurchases : this.purchases;
    if (!list || list.length === 0) return 0;
    return list.reduce((sum: number, p: any) => sum + (Number(p.paidAmount ?? p.paid_amount ?? 0) || 0), 0);
  }

  getTotalOutstanding(useFiltered: boolean = true): number {
    const list = useFiltered ? this.filteredPurchases : this.purchases;
    if (!list || list.length === 0) return 0;
    return list.reduce((sum: number, p: any) => {
      const total = Number(p.totalCost ?? p.total_cost ?? 0) || 0;
      const paid = Number(p.paidAmount ?? p.paid_amount ?? 0) || 0;
      const out = Math.max(0, total - paid);
      return sum + out;
    }, 0);
  }

  navigateToCreatePurchase() {
    // Clear state when creating a new purchase
    this.purchaseListStateService.clearState();
    this.router.navigate(['/create-purchase']);
  }

  viewProducts(purchase: PurchaseListItem) {
    // Save the current search state before opening dialog
    this.purchaseListStateService.saveState(
      this.searchQuery,
      this.filteredPurchases,
      this.currentPage,
      this.isSearching,
      this.allPurchasesData,
      this.totalPages,
      this.totalCount,
      this.suppliers
    );
    this.loadingProducts = true;
    const id = purchase.purchaseId ?? purchase.supId ?? 0;
    this.purchaseService.getPurchaseById(id).subscribe({
      next: (fullPurchase: any) => {
        console.log('Full purchase from backend:', fullPurchase);
        // If products is an array of objects, use as is
        if (Array.isArray(fullPurchase.products) && fullPurchase.products.length > 0 && typeof fullPurchase.products[0] === 'object') {
          this.dialog.open(ViewProductsDialogComponent, {
            width: '700px',
            data: {
              products: fullPurchase.products,
              purchaseId: fullPurchase.purchaseId ?? fullPurchase.id,
            }
          });
          this.loadingProducts = false;
        } else if (Array.isArray(fullPurchase.products) && fullPurchase.products.length > 0) {
          // If products is an array of IDs, fetch each product
          const productRequests = fullPurchase.products.map((id: number) =>
            this.fetchProductById(id)
          );
          forkJoin(productRequests).subscribe(
            (products) => {
              this.dialog.open(ViewProductsDialogComponent, {
                width: '700px',
                data: { products: products as any[] }
              });
              this.loadingProducts = false;
            },
            (err) => {
              console.error('Failed to load products for purchase', err);
              this.dialog.open(ViewProductsDialogComponent, {
                width: '700px',
                data: { products: [] }
              });
              this.loadingProducts = false;
            }
          );
        } else {
          // No products found, show empty
          this.dialog.open(ViewProductsDialogComponent, {
            width: '700px',
            data: { products: [] }
          });
          this.loadingProducts = false;
        }
      },
      error: err => {
        console.error('Failed to load purchase', err);
        this.dialog.open(ViewProductsDialogComponent, {
          width: '700px',
          data: { products: [] }
        });
        this.loadingProducts = false;
      }
    });
  }

  fetchProductById(id: number) {
    // Use the product API directly and unwrap the product from the response
  return this.purchaseService['http'].get(`${BASE_URL}/product/api/getProductById/${id}`).pipe(
      map((resp: any) => {
        const { statusCode, desc, ...product } = resp;
        return product;
      })
    );
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      if (!this.isSearching) {
        this.loadPurchases(this.currentPage);
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      if (!this.isSearching) {
        this.loadPurchases(this.currentPage);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (!this.isSearching) {
        this.loadPurchases(page);
      }
    }
  }

  getPaginatedPurchases(): any[] {
    if (this.isSearching) {
      // In search mode, slice from all filtered data
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.allPurchasesData.slice(startIndex, endIndex);
    } else {
      // In normal mode, return all filtered purchases (already paginated from backend)
      return this.filteredPurchases;
    }
  }

  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Helper to check if a date string is valid for DatePipe
  isValidDate(date: any): boolean {
    return date && !isNaN(Date.parse(date));
  }
}
