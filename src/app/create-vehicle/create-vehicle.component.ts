import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VehicleService } from '../services/vehicle.service';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-create-vehicle',
  templateUrl: './create-vehicle.component.html',
  styleUrls: ['./create-vehicle.component.scss']
})
export class CreateVehicleComponent {
  make: string = '';
  model: string = '';
  year: string = '';
  loading: boolean = false;

  constructor(
    private vehicleService: VehicleService,
    public dialogRef: MatDialogRef<CreateVehicleComponent>,
    private matDialog: MatDialog
  ) {}

  createVehicle(): void {
    this.loading = true;
    this.vehicleService.createVehicle({ make: this.make, model: this.model, year: this.year })
      .subscribe(
        (result) => {
          this.loading = false;
          this.dialogRef.close({ vehicle: result });
        },
        (error) => {
          this.loading = false;
          // Show failure dialog with backend error message if available
          let errorMsg = 'Failed to save vehicle. Please try again.';
          if (error && error.error) {
            if (typeof error.error === 'string') {
              errorMsg = error.error;
            } else if (error.error.message) {
              errorMsg = error.error.message;
            }
          } else if (error && error.message) {
            errorMsg = error.message;
          }
          this.dialogRef.close();
          this.matDialog.open(FailureDialogComponent, {
            width: '400px',
            panelClass: 'modern-failure-dialog',
            data: { message: errorMsg }
          });
        }
      );
  }
}
