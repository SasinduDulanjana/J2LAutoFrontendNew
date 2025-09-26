import { BASE_URL } from '../base-url';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
	providedIn: 'root'
})
export class VehicleService {
		private apiUrl = BASE_URL + '/product/api/vehicles';

	constructor(private http: HttpClient) {}

	getAllVehicles(): Observable<Vehicle[]> {
		return this.http.get<Vehicle[]>(this.apiUrl);
	}
}
