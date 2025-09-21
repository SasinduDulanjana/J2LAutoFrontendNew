import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-quantity-input',
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.scss']
})
export class QuantityInputComponent {
  quantity: string = ''; // Start with an empty string to build the number
  isPopupVisible = false;

  constructor(
    public dialogRef: MatDialogRef<QuantityInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Add a digit to the quantity
  addDigit(digit: string): void {
    this.quantity += digit;
  }

  // Remove the last digit from the quantity
  removeLastDigit(): void {
    this.quantity = this.quantity.slice(0, -1);
  }

  // Method to confirm the quantity
  onConfirm(): void {
    const quantityNum = parseInt(this.quantity, 10);
    if (quantityNum > 0) {
      this.dialogRef.close(quantityNum);
    } else {
      alert("Please enter a valid quantity.");
    }
  }

  // Method to cancel the dialog
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

  openPopup() {
    this.isPopupVisible = true;
  }
}
