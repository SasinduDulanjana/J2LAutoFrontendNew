import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient) {}

  private baseUrl = BASE_URL + '/payments/api';

  saveExpense(expense: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/saveExpense`, expense);
  }

  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllExpenses`);
  }

    getPaymentDetailsOfExpense(expenseId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/paymentDetailsOfExpenses/${expenseId}`);
    }
    updateExpensePaymentAmount(payload: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/updateExpensePaymentAmount`, payload);
    }
  }
