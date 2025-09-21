import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Batch } from '../models/batch.model';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getAllProductsByBatchWise(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllProductsByBatchWise`);
  }

  private baseUrl = BASE_URL + '/product/api';

  constructor(private http: HttpClient) {}


  createProduct(product: Product): Observable<Product> {
    const url = `${this.baseUrl}/createProduct`;
    return this.http.post<Product>(url, product);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/getAllProducts`);
  }

  deleteProducts(productIds: number[]): Observable<void> {
    const url = `${this.baseUrl}/deleteProducts`; // Create a new endpoint for bulk delete
    return this.http.post<void>(url, { ids: productIds });
  }

  deleteProduct(product: Product): Observable<void> {
    console.log("eeee" + product)
    return this.http.post<any>(`${this.baseUrl}/deleteProduct`, product);
  }

  getProductById(id: number): Observable<Product> {
    const url = `${this.baseUrl}/getProductById/${id}`;
    return this.http.get<Product>(url);
  }

  updateProduct(product: Product): Observable<Product> {
    const url = `${this.baseUrl}/updateProduct`;
    return this.http.post<Product>(url, product);
  }

  getBatchNumbersForProduct(sku: string): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/batchNumbers/${sku}`);
  }

  // searchProductBySkuOrBarcode(term: string): Observable<Product[]> {
  //   return this.http.get<Product[]>(`${this.baseUrl}/products/search?term=${term}`);
  // }

  searchProductBySkuOrBarcode(term: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/getProductByBarcodeOrSku/${term}`);
  }

  searchProductByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/getProductByCategory/${categoryId}`);
  }

  getAvailableQuantity(skuId: string, batchNumber: string): Observable<number> {
    const url = `${this.baseUrl}/inventory/availableQuantity/${skuId}/${batchNumber}`;
    return this.http.get<number>(url);
  }
}
