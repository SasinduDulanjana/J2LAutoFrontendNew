
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { RoleService, Role } from '../services/role.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  newUser: User = { username: '', email: '', roles: [], status: 1 };
  repeatPassword: string = '';
  editingUser: User | null = null;
  loading: boolean = true;

  constructor(private userService: UserService, private roleService: RoleService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loading = true;
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users.map(u => ({
          ...u,
          status: typeof u.status === 'string'
            ? (u.status === 'Active' || u.status === '1' ? 1 : u.status === 'Inactive' || u.status === '0' ? 0 : 0)
            : u.status === 1 ? 1 : u.status === 0 ? 0 : 0
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.roleService.getActiveRoles().subscribe({
      next: roles => {
        console.log('Active roles loaded:', roles);
        // Ensure only roles with status === 1 are shown
        this.roles = roles.filter(r => {
          if (typeof r.status === 'string') {
            return r.status === '1' || r.status === 'Active';
          }
          return r.status === 1;
        });
      },
      error: err => {
        console.error('Error loading active roles:', err);
      }
    });
  }

  addUser() {
    this.loading = true;
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password || !this.repeatPassword || !this.newUser.roles.length || !this.newUser.status) {
      alert('All fields are mandatory!');
      this.loading = false;
      return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      alert('Please enter a valid email address!');
      this.loading = false;
      return;
    }
    if (this.newUser.password !== this.repeatPassword) {
      alert('Passwords do not match!');
      this.loading = false;
      return;
    }
    if (this.editingUser && this.editingUser.id) {
      // Update user
      this.userService.updateUser({ ...this.newUser, id: this.editingUser.id }).subscribe({
        next: () => {
          this.loadUsers();
          this.editingUser = null;
          this.resetNewUser();
          this.loading = false;
          this.dialog.open(SuccessDialogComponent, {
            data: { message: 'User updated successfully!' },
          });
        },
        error: err => {
          this.loading = false;
          console.error('Error updating user:', err);
        }
      });
    } else {
      // Add user
      this.userService.addUser(this.newUser).subscribe({
        next: () => {
          this.loadUsers();
          this.resetNewUser();
          this.loading = false;
          this.dialog.open(SuccessDialogComponent, {
            data: { message: 'User created successfully!' },
          });
        },
        error: err => {
          this.loading = false;
          let message = 'Error adding user: ' + (err.error?.message || err.message || 'Unknown error');
          if (err && err.error && typeof err.error === 'string') {
            if (err.error.includes('username')) {
              message = 'A user with the same username already exists';
            } else if (err.error.includes('email')) {
              message = 'A user with the same email already exists';
            }
          }
          this.dialog.open(FailureDialogComponent, {
            data: { message },
          });
          console.error('Error adding user:', err);
        }
      });
    }
  }

  editUser(user: User) {
    this.newUser = { ...user, roles: [...user.roles] };
    this.editingUser = user;
  }

  deleteUser(user: User) {
    if (user.id && confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: err => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  resetNewUser() {
    this.newUser = { username: '', email: '', roles: [], status: 1 };
    this.repeatPassword = '';
  }
  
  toggleRole(roleName: string) {
    this.newUser.roles = [roleName];
  }
  
  getRoleNames(user: User): string {
    if (!user.roles || user.roles.length === 0) return '';
    // If roles are objects with a 'name' property
    if (typeof user.roles[0] === 'object' && user.roles[0] !== null && 'name' in user.roles[0]) {
      return (user.roles as any[]).map(r => r.name).join(', ');
    }
    // If roles are strings
    return (user.roles as string[]).join(', ');
  }
}
