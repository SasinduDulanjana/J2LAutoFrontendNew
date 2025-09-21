import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

export interface Role {
  id?: number;
  name: string;
  description?: string;
  status?: number | string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = BASE_URL + '/role'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getActiveRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/active`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
