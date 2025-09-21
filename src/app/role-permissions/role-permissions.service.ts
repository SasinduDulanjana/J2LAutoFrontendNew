import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RolePermission } from './role-permissions.model';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url';

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  private apiUrl = BASE_URL + '/role-permissions';
  private permissions: RolePermission[] = [];

  constructor(private http: HttpClient) {}

  loadPermissions(): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(this.apiUrl);
  }

  savePermissions(permissions: RolePermission[]): Observable<RolePermission[]> {
    return this.http.post<RolePermission[]>(this.apiUrl, permissions);
  }

  getPermissionsForRole(role: string): RolePermission[] {
    return this.permissions.filter(p => p.role === role);
  }

  can(role: string, feature: string): boolean {
    const perm = this.permissions.find(p => p.role === role && p.feature === feature);
    return !!perm && perm.enabled;
  }

  // getAllFeatures removed: now features are fetched from backend

  setPermission(role: string, feature: string, enabled: boolean) {
    const perm = this.permissions.find(p => p.role === role && p.feature === feature);
    if (perm) {
      perm.enabled = enabled;
    } else {
      this.permissions.push({ role, feature, enabled });
    }
    // Save to backend after change
    this.savePermissions(this.permissions).subscribe();
  }

  // For admin UI: get all roles
  getAllRoles(): string[] {
    return Array.from(new Set(this.permissions.map(p => p.role)));
  }

  setLocalPermissions(perms: RolePermission[]) {
    this.permissions = perms;
  }
}
