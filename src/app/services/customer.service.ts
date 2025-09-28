import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl = BASE_URL + '/customer/api';

  constructor(private http: HttpClient) { }

  createCustomer(customer: Customer): Observable<Customer> {
    const url = `${this.baseUrl}/createCustomer`;
    return this.http.post<Customer>(url, customer);
  }

  findAllCustomers(): Observable<any> {
    const url = `${this.baseUrl}/getAllCustomers`;
    return this.http.get<any>(url);
  }

  findAllCustomersWithoutStatus(): Observable<any> {
    const url = `${this.baseUrl}/getAllCustomersWithoutStatus`;
    return this.http.get<any>(url);
  }

  findAllCustomersWithOutstanding(): Observable<any> {
    const url = `${this.baseUrl}/getAllCustomerDetailsWithSummary`;
    return this.http.get<any>(url);
  }

  getCustomerWithOutstanding(custId: number): Observable<any> {
      const url = `${this.baseUrl}/getCustomerWithOutstanding/${custId}`;
      return this.http.get<any>(url);
    }

  deleteCustomers(customerIds: number[]): Observable<void> {
    const url = `${this.baseUrl}/deleteCustomers`; // Create a new endpoint for bulk delete
    return this.http.post<void>(url, { ids: customerIds });
  }

  deleteCustomer(customer: Customer): Observable<void> {
    console.log("eeee" + customer)
    return this.http.post<any>(`${this.baseUrl}/deleteCustomer`, customer);
  }

  getCustomerById(id: number): Observable<Customer> {
    const url = `${this.baseUrl}/getCustomerById/${id}`;
    return this.http.get<Customer>(url);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    const url = `${this.baseUrl}/updateCustomer`;
    return this.http.post<Customer>(url, customer);
  }

  /**
   * Search customers by name or phone (partial match)
   */
 searchCustomers(term: string): Observable<Customer[]> {
  const url = `${this.baseUrl}/getCustomersByNameOrPhone/${encodeURIComponent(term)}`;
  return this.http.get<Customer[]>(url);
}

}
