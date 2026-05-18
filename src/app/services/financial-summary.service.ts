import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class FinancialSummaryService {
  private baseUrl = BASE_URL + '/financialSummary';

  constructor(private http: HttpClient) { }

  /**
   * Get monthly financial figures
   * @returns Observable containing array of monthly financial data
   */
  getMonthlyFigures(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/monthly`);
  }

  /**
   * Get total financial summary
   * @returns Observable containing total financial data
   */
  getTotalSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/totalSummary`);
  }
}
