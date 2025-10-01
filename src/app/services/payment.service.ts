import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  getAllChequeDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/payments/api/getAllChequeDetails`);
  }
}
