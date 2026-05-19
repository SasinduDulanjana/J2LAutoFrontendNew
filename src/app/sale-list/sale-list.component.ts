import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SaleService } from '../services/sale.service';
import { SaleListStateService } from '../services/sale-list-state.service';
import { Sale } from '../models/sale.model';
import { ProductListPopupComponent } from '../product-list-popup/product-list-popup.component';
import { SaleProduct } from '../models/sale-product.model';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss']
})
export class SaleListComponent {
  productLoadingIndex: number|null = null;
  goToPaymentDetails(sale: any): void {
    // Save the current search state before navigating
    this.saleListStateService.saveState(
      this.searchQuery,
      this.filteredSales,
      this.currentPage,
      this.isSearching,
      this.allSalesData,
      this.totalPages,
      this.totalCount
    );
    const invoiceNumber = sale.invoiceNumber;
    this.router.navigate(['/payment-history', invoiceNumber]);
  }
  loading: boolean = false;
  sales: any[] = [];
  filteredSales: any[] = [];
  allSalesData: any[] = []; // Store all sales for search/filtering
  searchQuery: string = '';
  selectedSales: number[] = [];
  selectAll: boolean = false;
  userMap: { [key: number]: string } = {};
  customerMap: { [key: number]: string } = {};
  isSearching: boolean = false; // Track if we're in search mode

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;

  constructor(
    private saleService: SaleService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private customerService: CustomerService,
    private saleListStateService: SaleListStateService
  ) { }

  ngOnInit(): void {
    // Check if we have a saved search state to restore
    if (this.saleListStateService.hasState()) {
      const savedState = this.saleListStateService.getState();
      this.searchQuery = savedState.searchQuery;
      this.filteredSales = savedState.filteredSales;
      this.currentPage = savedState.currentPage;
      this.isSearching = savedState.isSearching;
      this.allSalesData = savedState.allSalesData;
      this.totalPages = savedState.totalPages;
      this.totalCount = savedState.totalCount;
      this.loading = false;
      console.log('Search state restored:', this.searchQuery);
    } else {
      // Load sales normally if no saved state
      this.loadSales();
    }
  }

  loadSales(page: number = 0): void {
    this.loading = true;
    this.isSearching = false;
    this.currentPage = page;
    this.saleService.findAllSalesPaginated(page, this.pageSize).subscribe(data => {
      // Sort by saleDate descending (latest first), handle custom date format
      const parseCustomDate = (str: string) => {
        if (!str) return 0;
        // Expecting format 'DD-MM-YYYY HH:mm:ss' or ISO
        if (/\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/.test(str)) {
          const [datePart, timePart] = str.split(' ');
          const [day, month, year] = datePart.split('-').map(Number);
          const [hour, minute, second] = timePart.split(':').map(Number);
          return new Date(year, month - 1, day, hour, minute, second).getTime();
        }
        // Fallback to Date.parse
        return Date.parse(str);
      };
      data.sort((a: any, b: any) => {
        const dateA = parseCustomDate(a.saleDate);
        const dateB = parseCustomDate(b.saleDate);
        return dateB - dateA;
      });
      this.sales = data;
      this.filteredSales = data; // For pagination, show this page's data
      this.allSalesData = data;
      
      // Calculate total pages based on initial load
      if (page === 0 && data.length > 0) {
        // For the first page, estimate total count
        // You may need to update backend to return totalCount
        this.totalCount = data.length >= this.pageSize ? this.pageSize * 10 : data.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.loading = true;
      this.isSearching = true;
      // Fetch all sales without pagination for searching
      this.saleService.findAllSalesWithoutPagination().subscribe((allSales: any[]) => {
        const terms = query.split(/\s+/).filter(Boolean);
        const filtered = allSales.filter((sale: any) => {
          // Vehicle multi-term search
          const vehicleStr = sale.vehicle ? `${sale.vehicle.make || ''} ${sale.vehicle.model || ''} ${sale.vehicle.year || ''}`.toLowerCase() : '';
          const vehicleMatch = terms.length > 1
            ? terms.every(t => vehicleStr.includes(t))
            : vehicleStr.includes(query);
          return (
            (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(query)) ||
            (sale.vehicleNumber && sale.vehicleNumber.toLowerCase().includes(query)) ||
            vehicleMatch ||
            (sale.customer?.name && sale.customer.name.toLowerCase().includes(query))
          );
        });

        // Sort filtered results by saleDate in descending order (latest first)
        const parseCustomDate = (str: string) => {
          if (!str) return 0;
          if (/\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/.test(str)) {
            const [datePart, timePart] = str.split(' ');
            const [day, month, year] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            return new Date(year, month - 1, day, hour, minute, second).getTime();
          }
          return Date.parse(str);
        };
        filtered.sort((a: any, b: any) => {
          const dateA = parseCustomDate(a.saleDate);
          const dateB = parseCustomDate(b.saleDate);
          return dateB - dateA;
        });
        
        // Set filtered sales and reset pagination
        this.filteredSales = filtered;
        this.allSalesData = filtered; // Keep all filtered data for pagination
        this.currentPage = 0;
        this.totalCount = filtered.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        
        // Save search state after successful search
        this.saleListStateService.saveState(
          this.searchQuery,
          this.filteredSales,
          this.currentPage,
          this.isSearching,
          this.allSalesData,
          this.totalPages,
          this.totalCount
        );
      }, error => {
        console.error('Error searching sales:', error);
        this.loading = false;
      });
    } else {
      // Reset to paginated view
      this.isSearching = false;
      this.saleListStateService.clearState();
      this.loadSales(0);
    }
  }

  onSelect(saleId: number): void {
    console.log('Selected customer:', saleId); // Log selected customer

    const index = this.selectedSales.indexOf(saleId);
    if (index > -1) {
      this.selectedSales.splice(index, 1);
    } else {
      this.selectedSales.push(saleId);
    }


    console.log('Currently selected customers:', this.selectedSales);
    this.selectAll = this.selectedSales.length === this.filteredSales.length;
    console.log('Select All:', this.selectAll)
  }

  deleteSale(sale: Sale): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.saleService.deleteSale(sale).subscribe(
        () => {
          // Clear search state since data is no longer valid
          this.saleListStateService.clearState();
          // After deletion, reload only ACTIVE sales
          this.saleService.findAllSales().subscribe(
            (activeSales: Sale[]) => {
              this.sales = activeSales;
              this.filteredSales = activeSales;
            },
            error => {
              console.error('Error fetching active sales:', error);
            }
          );
        },
        error => {
          console.error('Error deleting sale', error);
        }
      );
    }
  }

  navigateToDeletedSales() {
    this.saleListStateService.clearState();
    this.router.navigate(['/deleted-sale-list']);
  }

  navigateToHoldSales() {
    this.saleListStateService.clearState();
    this.router.navigate(['/hold-sale-list']);
  }

  navigateToUnpaidSales() {
    this.saleListStateService.clearState();
    this.router.navigate(['/partiallyPaid-sale-list']);
  }

  openProductListPopupForSale(sale: any, index: number): void {
    // Save the current search state before opening dialog
    this.saleListStateService.saveState(
      this.searchQuery,
      this.filteredSales,
      this.currentPage,
      this.isSearching,
      this.allSalesData,
      this.totalPages,
      this.totalCount
    );
    this.productLoadingIndex = index;
    setTimeout(() => {
      const saleId = sale.saleId || sale.id;
      if (!saleId) {
        alert('Sale ID not found!');
        return;
      }
      this.saleService.getProductsForSale(saleId).subscribe(products => {
        this.dialog.open(ProductListPopupComponent, {
          // Use a responsive width so popup is wider on large screens but fits on small screens
          width: '90vw',
          maxWidth: '1000px',
          data: { products }
        });
        this.productLoadingIndex = null;
      });
    }, 500); // Simulate loading, adjust as needed
  }

  printInvoice(sale: any): void {
    const invoiceNumber = sale.invoiceNumber || sale.id || sale.saleId;
    if (!invoiceNumber) {
      alert('Invoice identifier not available for this sale');
      return;
    }
    // Open invoice page in a new tab with invoiceNumber as query param
    const url = `${window.location.origin}/#/invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`;
    window.open(url, '_blank');
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      if (!this.isSearching) {
        this.loadSales(this.currentPage);
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      if (!this.isSearching) {
        this.loadSales(this.currentPage);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (!this.isSearching) {
        this.loadSales(page);
      }
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

  getPaginatedSales(): any[] {
    if (this.isSearching) {
      // In search mode, slice from all filtered data
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.allSalesData.slice(startIndex, endIndex);
    } else {
      // In normal mode, return all filtered sales (already paginated from backend)
      return this.filteredSales;
    }
  }
}
