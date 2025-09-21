import { Component } from '@angular/core';
import { Sale } from '../models/sale.model';
import { SaleService } from '../services/sale.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductListPopupComponent } from '../product-list-popup/product-list-popup.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { SaleProduct } from '../models/sale-product.model';

@Component({
  selector: 'app-partially-paid-sale-list',
  templateUrl: './partially-paid-sale-list.component.html',
  styleUrls: ['./partially-paid-sale-list.component.scss']
})
export class PartiallyPaidSaleListComponent {
  sales: any[] = [];
  filteredSales: any[] = [];
  searchQuery: string = '';
  selectedSales: number[] = [];
  selectAll: boolean = false;

  constructor(private saleService: SaleService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.saleService.findAllPartiallyPaidSales().subscribe(data => {
      this.sales = data;
      this.filteredSales = data;
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

  onSelectAll(): void {
    if (this.selectAll) {
      this.selectedSales = this.filteredSales.map(sale => sale.id);
    } else {
      this.selectedSales = [];
    }
  }

  isSelected(customerId: number): boolean {
    return this.selectedSales.includes(customerId);
  }

  // deleteSelected(): void {
  //   if (confirm('Are you sure you want to delete the selected customers?')) {
  //     // Call the service to delete selected customers
  //     this.saleService.deleteSales(this.selectedSales).subscribe(
  //       () => {
  //         // Remove deleted customers from the list
  //         this.sales = this.sales.filter(sale =>
  //           !this.selectedSales.includes(sale.id)
  //         );
  //         this.filteredSales = this.filteredSales.filter(sale =>
  //           !this.selectedSales.includes(sale.id)
  //         );
  //         this.selectedSales = [];
  //         this.selectAll = false;
  //       },
  //       error => {
  //         console.error('Error deleting sales', error);
  //       }
  //     );
  //   }
  // }

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

  openProductListPopup(saleProducts: SaleProduct[]): void {
    this.dialog.open(ProductListPopupComponent, {
      width: 'auto',
      maxWidth: 'none', // Ensures it doesn’t cap at a default max width
      data: { products: saleProducts }
    });
  }

  completeSale(sale: Sale): void {
    // Calculate due amount
    const dueAmount = (sale.totalAmount || sale.lineWiseDiscountTotalAmount) - (sale.paidAmount || 0);
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '350px',
      data: { maxAmount: dueAmount, paidAmount: sale.paidAmount || 0 }
    });
    dialogRef.afterClosed().subscribe((payAmount: number) => {
      if (payAmount && payAmount > 0) {
        // Only send the new payment amount, not the sum
        const updatedSale = { ...sale, paidAmount: payAmount };
        // If fully paid, set isFullyPaid true
        const newDue = (sale.totalAmount || sale.lineWiseDiscountTotalAmount) - ((sale.paidAmount || 0) + payAmount);
        if (newDue <= 0) {
          updatedSale.isFullyPaid = true;
        }
        this.saleService.updatePaidAMount(updatedSale).subscribe(
          () => {
            // Refresh unpaid sales list
            this.saleService.findAllPartiallyPaidSales().subscribe(
              (activeSales: Sale[]) => {
                this.sales = activeSales;
                this.filteredSales = activeSales;
              },
              error => {
                console.error('Error fetching sales:', error);
              }
            );
          },
          error => {
            console.error('Error updating payment:', error);
          }
        );
      }
    });
  }
}
