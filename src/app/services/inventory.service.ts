import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = 'http://your-api-url'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getBatchNumbersForProduct(sku: string): Observable<Batch[]> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Batch[]>(`${this.baseUrl}/inventory/batches/${sku}`, headers ? { headers } : {});
  }

  updateInventory(batchNumber: string, qtySold: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<void>(`${this.baseUrl}/inventory/update`, { batchNumber, qtySold }, headers ? { headers } : {});
  }
}
