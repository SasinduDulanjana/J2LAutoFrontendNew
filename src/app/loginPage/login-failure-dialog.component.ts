import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-failure-dialog',
  templateUrl: './login-failure-dialog.component.html',
  styleUrls: ['./login-failure-dialog.component.scss']
})
export class LoginFailureDialogComponent {
  public message: string;
  constructor(
    public dialogRef: MatDialogRef<LoginFailureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { message: string }
  ) {
    this.message = data.message;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
