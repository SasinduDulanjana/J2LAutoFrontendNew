
// ...existing code...

// (stray code removed)
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../models/purchase.model';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private baseUrl = BASE_URL + '/purchase/api';

  constructor(private http: HttpClient) {}


  createPurchase(purchase: Purchase): Observable<Purchase> {
    const url = `${this.baseUrl}/createPurchase`;
    return this.http.post<Purchase>(url, purchase);
  }

  getAllPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.baseUrl}/getAllPurchase`);
  }

  getPurchasesByDateRange(startDate: string, endDate: string): Observable<Purchase[]> {
    const url = `${this.baseUrl}/getPurchasesByDateRange?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<Purchase[]>(url);
  }

  // deleteCategories(categoryIds: number[]): Observable<void> {
  //   const url = `${this.baseUrl}/deleteCategories`; // Create a new endpoint for bulk delete
  //   return this.http.post<void>(url, { ids: categoryIds });
  // }

  // deleteCategory(categoryIds: number): Observable<void> {
  //   const url = `${this.baseUrl}/deleteCategory/${categoryIds}`; // Endpoint for deleting a single customer
  //   return this.http.delete<void>(url);
  // }

  getPurchaseById(id: number): Observable<Purchase> {
    const url = `${this.baseUrl}/getPurchaseById/${id}`;
    return this.http.get<Purchase>(url);
  }

  // updateCategory(category: Category): Observable<Category> {
  //   const url = `${this.baseUrl}/updateCategory`;
  //   return this.http.post<Category>(url, category);
  // }
}
