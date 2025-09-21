import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface FailureDialogData {
  message?: string;
  confirm?: boolean;
}

@Component({
  selector: 'app-failure-dialog',
  templateUrl: './failure-dialog.component.html',
  styleUrls: ['./failure-dialog.component.scss']
})
export class FailureDialogComponent {
  public data: FailureDialogData;
  constructor(
    public dialogRef: MatDialogRef<FailureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: FailureDialogData
  ) {
    this.data = injectedData;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
