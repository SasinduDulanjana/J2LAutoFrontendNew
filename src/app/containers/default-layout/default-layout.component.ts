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
    // Try to use cached permissions from localStorage
    const cached = localStorage.getItem('rolePermissions');
    if (cached) {
      try {
        const perms = JSON.parse(cached);
        this.rolePermService.setLocalPermissions(perms);
        this.filterNavItems();
      } catch {
        this.loadAndFilterNavItems();
      }
    } else {
      this.loadAndFilterNavItems();
    }
  }

  private loadAndFilterNavItems() {
    this.rolePermService.loadPermissions().subscribe((perms: any) => {
      this.rolePermService.setLocalPermissions(perms);
      localStorage.setItem('rolePermissions', JSON.stringify(perms));
      this.filterNavItems();
    });
  }

  private filterNavItems() {
    this.navItems = navItems.filter(item => {
      if (item.feature && !this.featurePerms.can(item.feature)) {
        return false;
      }
      if (item.roles) {
        const roles = this.authService.getUserRoles();
        return item.roles.some((role: string) => roles.includes(role));
      }
      return true;
    });
  }
}
