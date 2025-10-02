import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from '../models/sale.model';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  updateProductStatus(payload: { saleId: number, productId: number, batchNo: string, status: string }): Observable<any> {
    return this.http.post(`${BASE_URL}/sale/api/updateProductStatus`, payload);
  }
  fetchSaleProductsOfCustomerView(saleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/sale/api/fetchSaleProductsOfCustomerView/${saleId}`);
  }
  sendSaleDetailsSms(saleId: string): Observable<any> {
    return this.http.post(`${BASE_URL}/sale/api/sendSaleDetailsSms/${saleId}`, {});
  }
  getSaleDetails(saleId: string): Observable<any> {
    return this.http.get(`${BASE_URL}/sales/api/getSaleDetails/${saleId}`);
  }

  markItemReceived(saleId: string, productId: string): Observable<any> {
    return this.http.put(`${BASE_URL}/sales/api/markItemReceived/${saleId}/${productId}`, {});
  }
  createPaymentDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createPaymentDetails`, payload);
  }

  private baseUrl = BASE_URL + '/sale/api';


  salesReturn(payload: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/salesReturn`, payload, { responseType: 'text' });
  }
  getProductsForSale(saleId: number): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/getProductsForSale/${saleId}`, {});
  }

  getSaleByInvoiceNumber(invoiceNumber: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/getSaleByInvoiceNumber/${invoiceNumber}`);
  }

  getPaymentsByInvoiceNumber(invoiceNumber: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/getPaymentDetailsByInvoice/${invoiceNumber}`);
  }


  constructor(private http: HttpClient) { }

  getSalesByDateRange(startDate: string, endDate: string): Observable<any[]> {
    const url = `${this.baseUrl}/getSalesByDateRange?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any[]>(url);
  }

  createSale(sale: Sale): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createSale`, sale);
  }

  getInvoiceNumber(): Observable<string> {
    return this.http.get(`${this.baseUrl}/getInvoiceNumber`, { responseType: 'text' });
  }

  findAllSales(): Observable<any> {
    const url = `${this.baseUrl}/getAllSale`;
    return this.http.get<any>(url);
  }

  findAllDeletedSales(): Observable<any> {
    const url = `${this.baseUrl}/getAllDeletedSales`;
    return this.http.get<any>(url);
  }

  findAllHoldSales(): Observable<any> {
    const url = `${this.baseUrl}/getAllHoldSales`;
    return this.http.get<any>(url);
  }

  findAllPartiallyPaidSales(): Observable<any> {
    const url = `${this.baseUrl}/getAllPartiallyPaidSales`;
    return this.http.get<any>(url);
  }

  deleteSale(sale: Sale): Observable<any> {
    console.log("eeee" + sale)
    return this.http.post<any>(`${this.baseUrl}/deleteSale`, sale);
  }

  updatePaidAMount(sale: Sale): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/updatePaidAMount`, sale);
  }

  deleteHoldSale(saleId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/deleteHoldSale`, { saleId });
  }

  getAllSalesReturn(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllSalesReturn`);
  }
}
