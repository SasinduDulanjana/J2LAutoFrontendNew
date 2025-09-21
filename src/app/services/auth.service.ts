// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { BASE_URL } from '../base-url';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Decode JWT and get user roles
  getUserRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // If roles/authorities are present, use them
      if (payload.roles && Array.isArray(payload.roles)) {
        return payload.roles;
      }
      if (payload.authorities && Array.isArray(payload.authorities)) {
        return payload.authorities;
      }
      // Fallback: treat certain usernames as ADMIN if no roles present
      if (payload.sub && ["admin", "ADMIN", "Dulanjanaaaa"].includes(payload.sub)) {
        return ["ADMIN"];
      }
      return [];
    } catch {
      return [];
    }
  }
  private loginUrl = BASE_URL +'/users/login'; // Replace with your API endpoint
  isLoggedInStatus= false;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
  return this.http.post<any>(this.loginUrl, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isLoggedInStatus = true;
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isLoggedInStatus || !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Example for a protected API call (e.g., getAllSuppliers)
  getAllSuppliers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.get(BASE_URL + '/supplier/api/getAllSuppliers', { headers });
  }

  getAllUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.get(BASE_URL + '/users', { headers });
  }

  getUser(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.get(`${BASE_URL}/users/${id}`, { headers });
  }

  createUser(user: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.post(`${BASE_URL}/users`, user, { headers });
  }

  updateUser(id: number, user: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.put(`${BASE_URL}/users/${id}`, user, { headers });
  }

  deleteUser(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.delete(`${BASE_URL}/users/${id}`, { headers });
  }
}
