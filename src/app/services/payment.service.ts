import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  editChequeStatus(chequeNo: string, status: string): Observable<any> {
    return this.http.put(
      `${BASE_URL}/payments/api/updateChequeStatus/${encodeURIComponent(chequeNo)}/${encodeURIComponent(status)}`,
      {}
    );
  }
  constructor(private http: HttpClient) {}

  getAllChequeDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/payments/api/getAllChequeDetails`);
  }
}
