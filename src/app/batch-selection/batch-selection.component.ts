import { Component, Inject, Input } from '@angular/core';
import { Batch } from '../models/batch.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-batch-selection',
  templateUrl: './batch-selection.component.html',
  styleUrls: ['./batch-selection.component.scss']
})
export class BatchSelectionComponent {
  selectedBatch: Batch | null = null;
  saleQty: number = 1;
  batchList: Batch[] = [];
  showBatchSelection: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BatchSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.batchList = data.batchList; // Get the batch list passed from the dialog
  }

  selectBatch(batch: any): void {
    this.selectedBatch = batch; // Set the selected batch
    this.dialogRef.close(batch);
  }

  // Method to cancel and close the dialog
  onCancel(): void {
    this.dialogRef.close();
  }
}
