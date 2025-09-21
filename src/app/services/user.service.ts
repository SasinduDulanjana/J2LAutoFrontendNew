import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  roles: string[];
  status: number; // 1 for Active, 0 for Inactive
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = BASE_URL + '/users'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserDetailsByUsername(username: string): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/getUserByName/${username}`);
}

  addUser(user: User): Observable<User> {
    // Convert status from string to number before sending to backend
    const userToSend = { 
      ...user, 
      status: typeof user.status === 'string' 
        ? (user.status === 'Active' ? 1 : user.status === 'Inactive' ? 0 : 0) 
        : user.status 
    };
    return this.http.post<User>(this.apiUrl, userToSend);
  }

  updateUser(user: User): Observable<User> {
    const userToSend = { 
      ...user, 
      status: typeof user.status === 'string' 
        ? (user.status === 'Active' ? 1 : user.status === 'Inactive' ? 0 : 0) 
        : user.status 
    };
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, userToSend);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
