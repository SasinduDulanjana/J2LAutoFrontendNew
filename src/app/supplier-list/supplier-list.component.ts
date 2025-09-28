import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../services/supplier.service';
import { Router } from '@angular/router';
import { CreateSupplierComponent } from '../create-supplier/create-supplier.component';
import { MatDialog } from '@angular/material/dialog';
import { Supplier } from '../models/supplier.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss']
})
export class SupplierListComponent implements OnInit{
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  searchQuery: string = '';
  selectedSuppliers: number[] = []; // Array to store selected supplier IDs
  selectAll: boolean = false;
  loading: boolean = false;

  constructor(private supplierService: SupplierService, private router: Router,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loading = true;
    this.supplierService.findAllSuppliersWithoutStatus().subscribe(data => {
      this.suppliers = data;
      this.filteredSuppliers = data;
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSuppliers = this.suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(query.toLowerCase()) ||
        supplier.phone.toLowerCase().includes(query)
      );
    } else {
      this.filteredSuppliers = this.suppliers;
    }
  }

  // onSelect(supplierId: number): void {
  //   const index = this.selectedSuppliers.indexOf(supplierId);
  //   if (index > -1) {
  //     this.selectedSuppliers.splice(index, 1);
  //   } else {
  //     this.selectedSuppliers.push(supplierId);
  //   }
  // }

  // onSelectAll(): void {
  //   if (this.selectAll) {
  //     this.selectedSuppliers = this.filteredSuppliers.map(supplier => supplier.id);
  //   } else {
  //     this.selectedSuppliers = [];
  //   }
  // }

  // isSelected(supplierId: number): boolean {
  //   return this.selectedSuppliers.includes(supplierId);
  // }

  // deleteSelected(): void {
  //   if (confirm('Are you sure you want to delete the selected suppliers?')) {
  //     // Call the service to delete selected customers
  //     this.supplierService.deleteSuppliers(this.selectedSuppliers).subscribe(
  //       () => {
  //         // Remove deleted customers from the list
  //         this.suppliers = this.suppliers.filter(supplier =>
  //           !this.selectedSuppliers.includes(supplier.id)
  //         );
  //         this.filteredSuppliers = this.filteredSuppliers.filter(supplier =>
  //           !this.selectedSuppliers.includes(supplier.id)
  //         );
  //         this.selectedSuppliers = [];
  //         this.selectAll = false;
  //       },
  //       error => {
  //         console.error('Error deleting suppliers', error);
  //       }
  //     );
  //   }
  // }


  deleteSupplier(supplier: Supplier): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this supplier?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.supplierService.deleteSupplier(supplier).subscribe(
          () => {
            this.supplierService.findAllSuppliers().subscribe(
              (activeSuppliers: Supplier[]) => {
                this.suppliers = activeSuppliers;
                this.filteredSuppliers = activeSuppliers;
              },
              error => {
                console.error('Error fetching active suppliers:', error);
              }
            );
          },
          error => {
            console.error('Error deleting supplier', error);
          }
        );
      }
    });
  }

  editSupplier(supplier: any): void {
    console.log('Supplier:', supplier);
    if (supplier?.supId) {
      console.log('SupplierID:', supplier.supId);
      this.router.navigate(['/edit-supplier', supplier.supId]);
    } else {
      console.error('Supplier ID is undefined or null.');
    }
  }

  openCreateSupplierPopup() {
    const dialogRef = this.dialog.open(CreateSupplierComponent, {
      width: '800px', // Adjust the width as needed
      data: {} // You can pass data to the dialog here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
      }
    });
  }

  navigateToCreateSupplier() {
    this.router.navigate(['/create-supplier']);
  }


}
