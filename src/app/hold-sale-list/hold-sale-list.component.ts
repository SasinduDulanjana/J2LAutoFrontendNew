import { Component } from '@angular/core';
import { ProductListPopupComponent } from '../product-list-popup/product-list-popup.component';
import { SaleService } from '../services/sale.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Sale } from '../models/sale.model';

@Component({
  selector: 'app-hold-sale-list',
  templateUrl: './hold-sale-list.component.html',
  styleUrls: ['./hold-sale-list.component.scss']
})
export class HoldSaleListComponent {
  sales: any[] = [];
  filteredSales: any[] = [];
  searchQuery: string = '';
  selectedSales: number[] = [];
  selectAll: boolean = false;

  constructor(private saleService: SaleService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.saleService.findAllHoldSales().subscribe(data => {
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

  openProductListPopup(saleProducts: any[]): void {
    this.dialog.open(ProductListPopupComponent, {
      width: 'auto',
      maxWidth: 'none',
      data: { products: saleProducts }
    });
  }

  deleteSale(sale: any): void {
    if (confirm('Are you sure you want to delete this draft sale?')) {
      console.log('Deleting sale:', sale);
      const saleId = sale.id || sale.saleId || sale._id;
      if (!saleId) {
        alert('Sale ID is missing. Cannot delete.');
        return;
      }
      const saleToDelete = { ...sale, id: saleId };
      this.saleService.deleteSale(saleToDelete).subscribe(
        () => {
          // After deletion, reload only HOLD sales
          this.saleService.findAllHoldSales().subscribe(
            (holdSales: Sale[]) => {
              this.sales = holdSales;
              this.filteredSales = holdSales;
            },
            error => {
              console.error('Error fetching hold sales:', error);
            }
          );
        },
        error => {
          console.error('Error deleting sale', error);
        }
      );
    }
  }

  resumeSale(sale: any): void {
    this.saleService.deleteHoldSale(sale.saleId).subscribe({
      next: () => {
        this.router.navigate(['/create-sale'], { state: { holdSale: sale } });
      },
      error: err => {
        alert('Failed to update hold sale status.');
      }
    });
  }
}
