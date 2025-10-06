
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

  /**
   * Fetch paymentId by purchaseId
   */
  fetchPaymentByPurchaseId(purchaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/fetchPaymentByPurchaseId/${purchaseId}`);
  }

  /**
   * Fetch product batch details for a purchase
   * @param purchaseId purchase id
   */
  /**
   * Fetch product batch details for a purchase using POST and request body
   * @param purchaseId purchase id
   * @param batchNo batch number
   * @param productId product id
   */
  getProductBatchDetails(purchaseId: number, productId: number): Observable<any[]> {
    const body = { purchaseId, productId };
    return this.http.post<any[]>(`${this.baseUrl}/getProductBatchDetails`, body);
  }

   getPurchaseReturns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllPurchaseReturn`);
  }

  /**
   * Fetch purchase by either purchaseId or invoiceNumber
   * @param identifier purchaseId (number) or invoiceNumber (string)
   */
  getPurchaseByIdentifier(identifier: string | number): Observable<Purchase> {
    let url = '';
    url = `${this.baseUrl}/getPurchaseByIdentifier/${identifier}`;
    return this.http.get<Purchase>(url);
  }

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

  getPurchaseById(id: number): Observable<Purchase> {
    const url = `${this.baseUrl}/getPurchaseById/${id}`;
    return this.http.get<Purchase>(url);
  }

  // ...existing code...

  /**
   * Fetch payment details by purchaseId
   */
  getPaymentDetailsByPurchaseId(purchaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getPaymentDetailsByPurchaseId/${purchaseId}`);
  }

  /**
   * Create payment details for a purchase
   */
  createPaymentDetails(payload: {
    paymentId: number;
    method: string;
    amount: number;
    chequeNo?: string;
    bankName?: string;
    chequeDate?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createPaymentDetails`, payload);
  }

  savePurchaseReturn(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchaseReturn`, data);
  }
}
