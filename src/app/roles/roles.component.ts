
import { Component, OnInit } from '@angular/core';
import { RoleService, Role } from '../services/role.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  newRole: Role = { name: '', description: '' } as Role;
  editingRole: Role | null = null;

  constructor(private roleService: RoleService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: roles => {
        // Map status to number for all possible backend values
        this.roles = roles.map(r => ({
          ...r,
          status: typeof r.status === 'string'
            ? (r.status === 'Active' || r.status === '1' ? 1 : r.status === 'Inactive' || r.status === '0' ? 0 : 0)
            : r.status === 1 ? 1 : r.status === 0 ? 0 : 0
        }));
      },
      error: err => {
        console.error('Error loading roles:', err);
      }
    });
  }

  addRole() {
    if (this.editingRole && this.editingRole.id) {
      // Update role
      this.roleService.updateRole(this.editingRole.id, this.newRole).subscribe({
        next: updated => {
          this.loadRoles();
          this.editingRole = null;
          this.newRole = { name: '', description: '' } as Role;
          this.dialog.open(SuccessDialogComponent, { data: { message: 'Role updated successfully!' } });
        },
        error: err => {
          console.error('Error updating role:', err);
        }
      });
    } else if (this.newRole.name && this.newRole.description) {
      // Create role
      this.roleService.createRole(this.newRole).subscribe({
        next: created => {
          this.loadRoles();
          this.newRole = { name: '', description: '' } as Role;
          this.dialog.open(SuccessDialogComponent, { data: { message: 'Role created successfully!' } });
        },
        error: err => {
          console.error('Error creating role:', err);
        }
      });
    }
  }

  editRole(role: Role) {
    this.newRole = { name: role.name, description: role.description } as Role;
    this.editingRole = role;
  }

  deleteRole(role: Role) {
    if (role.id && confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
          this.dialog.open(SuccessDialogComponent, { data: { message: 'Role deleted successfully!' } });
        },
        error: err => {
          console.error('Error deleting role:', err);
        }
      });
    }
  }
}
