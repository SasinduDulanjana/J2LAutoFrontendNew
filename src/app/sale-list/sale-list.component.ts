import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SaleService } from '../services/sale.service';
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
    const invoiceNumber = sale.invoiceNumber;
    this.router.navigate(['/payment-history', invoiceNumber]);
  }
  loading: boolean = false;
  sales: any[] = [];
  filteredSales: any[] = [];
  searchQuery: string = '';
  selectedSales: number[] = [];
  selectAll: boolean = false;
  userMap: { [key: number]: string } = {};
  customerMap: { [key: number]: string } = {};

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  constructor(
    private saleService: SaleService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(page: number = 0): void {
    this.loading = true;
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
      this.filteredSales = data;
      
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
      const terms = query.split(/\s+/).filter(Boolean);
      this.filteredSales = this.sales.filter(sale => {
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
          // || (sale.customer?.phone && sale.customer.phone.toLowerCase().includes(query))
        );
      });
    } else {
      this.filteredSales = this.sales;
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
    this.router.navigate(['/deleted-sale-list']);
  }

  navigateToHoldSales() {
    this.router.navigate(['/hold-sale-list']);
  }

  navigateToUnpaidSales() {
    this.router.navigate(['/partiallyPaid-sale-list']);
  }

  openProductListPopupForSale(sale: any, index: number): void {
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
      this.loadSales(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.loadSales(this.currentPage - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadSales(page);
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
}
