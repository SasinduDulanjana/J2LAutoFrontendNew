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
    // Fetch all users and customers for mapping
    this.userMap = {};
    this.customerMap = {};
    this.saleService.findAllSales().subscribe(data => {
      // Sort by invoiceNumber ascending
      data.sort((a: any, b: any) => {
        if (a.invoiceNumber < b.invoiceNumber) return -1;
        if (a.invoiceNumber > b.invoiceNumber) return 1;
        return 0;
      });
      this.sales = data;
      this.filteredSales = data;
      // Map user and customer names
      this.userService.getUsers().subscribe(users => {
        users.forEach((user: any) => {
          this.userMap[user.id] = user.username;
        });
        this.filteredSales.forEach(sale => {
          sale.userName = this.userMap[sale.userId] || sale.userId;
        });
      });
      this.customerService.findAllCustomers().subscribe(customers => {
        customers.forEach((customer: any) => {
          // Use custId from backend response for mapping
          this.customerMap[customer.custId] = customer.name;
        });
        this.filteredSales.forEach(sale => {
          sale.customerName = this.customerMap[sale.custId] || sale.custId;
        });
      });
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

  // onSelectAll(): void {
  //   if (this.selectAll) {
  //     this.selectedSales = this.filteredSales.map(sale => sale.id);
  //   } else {
  //     this.selectedSales = [];
  //   }
  // }

  // isSelected(customerId: number): boolean {
  //   return this.selectedSales.includes(customerId);
  // }

  // deleteSelected(): void {
  //   if (confirm('Are you sure you want to delete the selected sale?')) {
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
    console.log("awaaaaaaa");
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

  // editCustomer(customer: any): void {
  //   console.log('Customer:', customer);
  //   if (customer?.custId) {
  //     this.router.navigate(['/edit-customer', customer.custId]);
  //   } else {
  //     console.error('Customer ID is undefined or null.');
  //   }
  // }

  // openCreateCustomerPopup() {
  //   const dialogRef = this.dialog.open(CreateCustomerComponent, {
  //     width: '800px', // Adjust the width as needed
  //     data: {} // You can pass data to the dialog here if needed
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log('The dialog was closed', result);
  //     }
  //   });
  // }

  navigateToDeletedSales() {
    this.router.navigate(['/deleted-sale-list']);
  }

  navigateToHoldSales() {
    this.router.navigate(['/hold-sale-list']);
  }

  navigateToUnpaidSales() {
    this.router.navigate(['/partiallyPaid-sale-list']);
  }

  openProductListPopup(saleProducts: SaleProduct[]): void {
    this.dialog.open(ProductListPopupComponent, {
      width: 'auto',
      maxWidth: 'none', // Ensures it doesn’t cap at a default max width
      data: { products: saleProducts }
    });
  }
  
}
