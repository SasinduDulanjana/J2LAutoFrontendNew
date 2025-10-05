import { Component, OnInit } from '@angular/core';
import { RolePermissionsService } from './role-permissions.service';
import { FeatureService, Feature } from '../services/feature.service';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {
  roles: string[] = [];
  features: Feature[] = [];
  selectedRole: string = '';
  permissions: { [feature: string]: boolean } = {};
  loading: boolean = true;

  constructor(private permService: RolePermissionsService, private featureService: FeatureService) {}

  ngOnInit() {
    this.loading = true;
    this.featureService.getFeatures().subscribe(features => {
      this.features = features;
      this.permService.loadPermissions().subscribe(perms => {
        this.permService.setLocalPermissions(perms);
        this.roles = this.permService.getAllRoles();
        if (this.roles.length > 0) {
          this.selectRole(this.roles[0]);
        }
        this.loading = false;
      }, () => { this.loading = false; });
    }, () => { this.loading = false; });
  }

  selectRole(role: string) {
    this.selectedRole = role;
    const perms = this.permService.getPermissionsForRole(role);
    this.permissions = {};
    this.features.forEach(f => {
      const p = perms.find(p => p.feature === f.featureName);
      this.permissions[f.featureName] = p ? p.enabled : false;
    });
  }

  toggleFeature(featureName: string) {
    const enabled = !this.permissions[featureName];
    this.permissions[featureName] = enabled;
    this.permService.setPermission(this.selectedRole, featureName, enabled);
  }
}
