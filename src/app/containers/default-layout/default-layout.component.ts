import { Component } from '@angular/core';

import { navItems } from './_nav';
import { INavDataWithRoles } from './_nav-roles';
import { AuthService } from '../../services/auth.service';
import { FeaturePermissionsService } from '../../services/feature-permissions.service';
import { RolePermissionsService } from '../../role-permissions/role-permissions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {

  public navItems: INavDataWithRoles[] = [];

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(
    private authService: AuthService,
    private featurePerms: FeaturePermissionsService,
    private rolePermService: RolePermissionsService
  ) {
    // Always load permissions fresh from backend
    this.loadAndFilterNavItems();
  }

  private loadAndFilterNavItems() {
    this.rolePermService.loadPermissions().subscribe((perms: any) => {
      this.rolePermService.setLocalPermissions(perms);
      this.filterNavItems();
    });
  }

  private filterNavItems() {
    const userRoles = this.authService.getUserRoles();
    console.log('Sidebar filter: userRoles', userRoles);
    this.navItems = navItems.filter(item => {
      if (item.feature) {
        const canAccess = this.featurePerms.can(item.feature);
        console.log(`Feature check for '${item.feature}':`, canAccess);
        if (!canAccess) return false;
      }
      if (item.roles) {
        const roles = userRoles;
        const hasRole = item.roles.some((role: string) => roles.includes(role));
        console.log(`Role check for '${item.name}':`, hasRole, 'Required:', item.roles, 'User:', roles);
        return hasRole;
      }
      return true;
    });
  }
}
