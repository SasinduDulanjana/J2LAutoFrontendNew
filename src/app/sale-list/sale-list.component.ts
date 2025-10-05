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

  constructor(
    private saleService: SaleService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.saleService.findAllSales().subscribe(data => {
      // Sort by transaction date and time descending (latest first)
      data.sort((a: any, b: any) => {
        // Try to use the most precise field available
        const dateA = new Date((a.saleDate));
        const dateB = new Date((b.saleDate));
        return dateB.getTime() - dateA.getTime();
      });
      this.sales = data;
      this.filteredSales = data;
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSales = this.sales.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(query.toLowerCase())
        // || customer.phone.toLowerCase().includes(query)
      );
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
          width: '700px',
          data: { products }
        });
        this.productLoadingIndex = null;
      });
    }, 500); // Simulate loading, adjust as needed
  }
}
