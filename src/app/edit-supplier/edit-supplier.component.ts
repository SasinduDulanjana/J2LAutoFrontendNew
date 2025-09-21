import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { SupplierService } from '../services/supplier.service';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.scss']
})
export class EditSupplierComponent {
  supplier: any = {};
  supplierId!: number;
  phoneExists: boolean = false;
  allSuppliers: any[] = [];

  constructor(
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.supplierService.findAllSuppliers().subscribe((suppliers: any[]) => {
      this.allSuppliers = suppliers;
    });
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.supplierId = idParam ? +idParam : 0; // Handle null value
      if (this.supplierId) {
        console.log('Inside if:', this.supplierId);
        this.supplierService.getSupplierById(this.supplierId).subscribe(data => {
          this.supplier = data;
        });
      } else {
        console.error('Invalid supplier ID');
      }
    });
  }

  onPhoneChange(phone: string): void {
    this.phoneExists = this.allSuppliers.some((s: any) => s.phone.trim() === phone.trim() && s.id !== this.supplierId);
  }

  saveSupplier(): void {
    this.supplierService.updateSupplier(this.supplier).subscribe({
      next: () => {
        const dialogRef = this.dialog.open(SuccessDialogComponent, {
          data: { message: 'Supplier updated successfully!' },
          panelClass: 'success-dialog-panel'
        });
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/supplier-list']); // Redirect after success
        });
      },
      error: (err) => {
        alert('Failed to update supplier: ' + (err?.error?.message || err.message || err));
        console.error('Update error:', err);
      }
    });
  }
}
