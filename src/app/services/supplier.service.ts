import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Supplier } from '../models/supplier.model';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = BASE_URL + '/supplier/api';

  constructor(private http: HttpClient) { }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    const url = `${this.baseUrl}/createSupplier`;
    return this.http.post<Supplier>(url, supplier);
  }

  findAllSuppliers(): Observable<any> {
    const url = `${this.baseUrl}/getAllSuppliers`;
    return this.http.get<any>(url);
  }

  findAllSuppliersWithoutStatus(): Observable<any> {
    const url = `${this.baseUrl}/getAllSuppliersWithoutStatus`;
    return this.http.get<any>(url);
  }

  deleteSuppliers(supplierIds: number[]): Observable<void> {
    const url = `${this.baseUrl}/deleteSuppliers`; // Create a new endpoint for bulk delete
    return this.http.post<void>(url, { ids: supplierIds });
  }

  deleteSupplier(supplier: Supplier): Observable<void> {
    console.log("eeee" + supplier)
    return this.http.post<any>(`${this.baseUrl}/deleteSupplier`, supplier);
  }

  getSupplierById(id: number): Observable<Supplier> {
    const url = `${this.baseUrl}/getSupplierById/${id}`;
    return this.http.get<Supplier>(url);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    const url = `${this.baseUrl}/updateSupplier`;
    return this.http.post<Supplier>(url, supplier);
  }
}
