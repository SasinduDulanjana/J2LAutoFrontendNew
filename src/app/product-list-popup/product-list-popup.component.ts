import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaleProduct } from '../models/sale-product.model';

@Component({
  selector: 'app-product-list-popup',
  templateUrl: './product-list-popup.component.html',
  styleUrls: ['./product-list-popup.component.scss']
})
export class ProductListPopupComponent {
  
  constructor(
    public dialogRef: MatDialogRef<ProductListPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: SaleProduct[] }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
