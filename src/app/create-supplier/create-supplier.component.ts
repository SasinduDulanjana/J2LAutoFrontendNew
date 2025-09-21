import { Component } from '@angular/core';
import { Supplier } from '../models/supplier.model'; // Correct path to the model
import { SupplierService } from '../services/supplier.service'; // Correct path to the service
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-create-supplier',
  templateUrl: './create-supplier.component.html',
  styleUrls: ['./create-supplier.component.scss']
})
export class CreateSupplierComponent {
  supplier: Supplier = new Supplier('', '', '', ''); // Initialize with empty values or defaults
  phoneExists: boolean = false;

  constructor(private supplierService: SupplierService, private dialog: MatDialog) { }

  createSupplier(): void {
    if (this.phoneExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Phone number already exists!' }
      });
      return;
    }
    this.supplierService.createSupplier(this.supplier)
      .subscribe(response => {
        console.log('Supplier created:', response);
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          width: '350px',
          data: { message: 'Supplier created successfully!' }
        });
        dialogRef.afterClosed().subscribe(() => {
          // Reset the form fields
          this.supplier = new Supplier('', '', '', '');
        });
      }, error => {
        let errorMsg = 'Error creating supplier.';
        if (error && error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        this.dialog.open(FailureDialogComponent, {
          width: '350px',
          data: { message: errorMsg }
        });
        console.error('Error creating supplier:', error);
      });
  }

  onPhoneChange(phone: string): void {
    this.supplierService.findAllSuppliers().subscribe((suppliers: Supplier[]) => {
      this.phoneExists = suppliers.some((s: Supplier) => s.phone.trim() === phone.trim());
    });
  }
}
