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
    const id = purchase.purchaseId ?? purchase.supId ?? 0;
    this.router.navigate(['/purchase-payment-details', id]);
  }
  purchases: PurchaseListItem[] = [];
  filteredPurchases: PurchaseListItem[] = [];
  searchQuery: string = '';
  suppliers: Supplier[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  this.loading = true;
  // Fetch suppliers first
  this.supplierService.findAllSuppliers().subscribe({
      next: (suppliers: Supplier[]) => {
        console.log('Suppliers loaded:', suppliers);
        this.suppliers = suppliers;
        // Now fetch purchases
        this.purchaseService.getAllPurchases().subscribe({
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
      this.filteredPurchases = this.purchases.filter(purchase =>
        (purchase.purchaseName && purchase.purchaseName.toLowerCase().includes(query)) ||
        (purchase.invoiceNumber && purchase.invoiceNumber.toLowerCase().includes(query)) ||
        (purchase.supplierName && purchase.supplierName.toLowerCase().includes(query))
      );
    } else {
      this.filteredPurchases = [...this.purchases];
    }
  }

  navigateToCreatePurchase() {
    this.router.navigate(['/create-purchase']);
  }

  viewProducts(purchase: PurchaseListItem) {
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
  // Helper to check if a date string is valid for DatePipe
  isValidDate(date: any): boolean {
    return date && !isNaN(Date.parse(date));
  }
}
