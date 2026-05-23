import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { RolePermissionsService } from './role-permissions/role-permissions.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'True Enterprises Inventory System';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private rolePermissionsService: RolePermissionsService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    // Load role permissions from backend at app startup
    this.rolePermissionsService.loadPermissions().subscribe(
      (permissions) => {
        this.rolePermissionsService.setLocalPermissions(permissions);
        console.log('✅ Role permissions loaded successfully');
      },
      (error) => {
        console.error('❌ Failed to load role permissions:', error);
      }
    );

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}
