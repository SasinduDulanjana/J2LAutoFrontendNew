import { Component, Injector } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Supplier } from '../models/supplier.model'; // Correct path to the model
import { SupplierService } from '../services/supplier.service'; // Correct path to the service
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
  loading: boolean = false;

  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private router: Router,
    private injector: Injector
  ) {
    // Try to get MatDialogRef if available
    try {
      this.dialogRef = this.injector.get(MatDialogRef, null);
    } catch (e) {
      this.dialogRef = null;
    }
  }

  createSupplier(): void {
    if (this.phoneExists) {
      this.dialog.open(FailureDialogComponent, {
        width: '350px',
        data: { message: 'Phone number already exists!' }
      });
      return;
    }
    this.loading = true;
    this.supplierService.createSupplier(this.supplier)
      .subscribe(response => {
        this.loading = false;
        console.log('Supplier created:', response);
        const successDialogRef = this.dialog.open(SuccessDialogComponent, {
          width: '350px',
          data: { message: 'Supplier created successfully!' }
        });
        successDialogRef.afterClosed().subscribe(() => {
          // If opened as a dialog, close and return true
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            // If opened as a page, navigate to supplier list
            this.router.navigate(['/supplier-list']);
          }
        });
      }, error => {
        this.loading = false;
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
    // Only check if phone is at least 10 digits
    if (/^\d{10,15}$/.test(phone.trim())) {
      this.supplierService.findAllSuppliers().subscribe((suppliers: Supplier[]) => {
        this.phoneExists = suppliers.some((s: Supplier) => s.phone.trim() === phone.trim());
      });
    } else {
      this.phoneExists = false;
    }
  }
}
