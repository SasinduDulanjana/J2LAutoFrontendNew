import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-discount-bill-wise',
  templateUrl: './discount-bill-wise.component.html',
  styleUrls: ['./discount-bill-wise.component.scss']
})
export class DiscountBillWiseComponent {
  discount: string = ''; // Initialize empty string to build the discount

  constructor(
    public dialogRef: MatDialogRef<DiscountBillWiseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  addDigit(digit: string): void {
    this.discount += digit;
  }

  removeLastDigit(): void {
    this.discount = this.discount.slice(0, -1);
  }

  onConfirm(): void {
    const discountNum = parseInt(this.discount, 10);
    if (discountNum >= 0 && discountNum <= 100) {
      this.dialogRef.close(discountNum);
    } else {
      alert('Please enter a valid discount between 0 and 100.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Handle keypress events
  onKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    if (!isNaN(Number(key)) && key.length === 1) {
      this.addDigit(key); // Append the digit if it's a number
    } else if (key === 'Backspace') {
      this.removeLastDigit(); // Remove the last character on backspace
    }else if (event.key === 'Enter') {
      this.onConfirm(); // Trigger the OK button when Enter is pressed
    }
  }
  
}
