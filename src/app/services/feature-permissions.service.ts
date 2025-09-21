import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';

@Injectable({ providedIn: 'root' })
export class FeaturePermissionsService {
  constructor(private authService: AuthService, private rolePermService: RolePermissionsService) {}

  can(feature: string): boolean {
    // Always get latest roles and permissions
    const userRoles = this.authService.getUserRoles();
    return userRoles.some(role => this.rolePermService.can(role, feature));
  }
}
