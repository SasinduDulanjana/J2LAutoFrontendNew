import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';

@Injectable({ providedIn: 'root' })
export class FeaturePermissionsService {
  constructor(private authService: AuthService, private rolePermService: RolePermissionsService) {
    // Load permissions from localStorage if available
    const cached = localStorage.getItem('rolePermissions');
    if (cached) {
      try {
        const perms = JSON.parse(cached);
        this.rolePermService.setLocalPermissions(perms);
      } catch {}
    } else {
      // If not cached, fetch and cache
      this.rolePermService.loadPermissions().subscribe(perms => {
        this.rolePermService.setLocalPermissions(perms);
        localStorage.setItem('rolePermissions', JSON.stringify(perms));
      });
    }
  }

  can(feature: string): boolean {
    // Use cached permissions
    const userRoles = this.authService.getUserRoles();
    return userRoles.some(role => this.rolePermService.can(role, feature));
  }
}
