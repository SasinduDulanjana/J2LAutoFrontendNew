import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { BASE_URL } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = BASE_URL + '/category/api';

  constructor(private http: HttpClient) {}


  createCategory(category: Category): Observable<Category> {
    const url = `${this.baseUrl}/createCategory`;
    return this.http.post<Category>(url, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/getAllCategories`);
  }

  deleteCategories(categoryIds: number[]): Observable<void> {
    const url = `${this.baseUrl}/deleteCategories`; // Create a new endpoint for bulk delete
    return this.http.post<void>(url, { ids: categoryIds });
  }

  deleteCategory(category: Category): Observable<void> {
    console.log("eeee" + category)
    return this.http.post<any>(`${this.baseUrl}/deleteCategory`, category);
  }

  getCategoryById(id: number): Observable<Category> {
    const url = `${this.baseUrl}/getCategoryById/${id}`;
    return this.http.get<Category>(url);
  }

  updateCategory(category: Category): Observable<Category> {
    const url = `${this.baseUrl}/updateCategory`;
    return this.http.post<Category>(url, category);
  }
}
