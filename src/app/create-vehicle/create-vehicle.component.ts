import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { VehicleService } from '../services/vehicle.service';

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
    public dialogRef: MatDialogRef<CreateVehicleComponent>
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
          // Optionally show error dialog
        }
      );
  }
}
